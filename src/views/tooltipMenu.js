define([
	"jquery",
	"use!backbone",
	"use!underscore",
	"use!ui",
	"use!qtip"
		],
function($, Backbone, _, ui, qtip){

	var TooltipMenuView = Backbone.View.extend({

        initialize: function(){
            this.registry = {};
            this.initialRender();
        },

        initialRender: function(){

            // Render menu container.
            this.$menuContainer = $('<div class="menu-container"></div>');
            $(this.el).append(this.$menuContainer);

            // Do initial rendering based on model.
            this.render();

        },

        render: function(){
            // Clear menu (if it exists).
            // This will remove any attached handlers as well.
            if (this.$menu){
                this.$menu.empty();
            }

            // Render menu.
            var menuDef = this.model.get('menu');
            if (menuDef){
                this.$menu = this.renderMenu(menuDef, 0)
                this.$menuContainer.append(this.$menu);
                this.connectMenu($(this.el), this.$menu, this.$menuContainer);
            }
        },

        renderMenu: function(menuDef, level){
            // Create menu item root.
            var $menu = $('<ul class="menu"></ul>');

            // For each menu item...
            _.each(menuDef.items, function(item){

                // Initialize item container.
                var $itemContainer = $('<li></li>');

                // Determine if the item is a leaf.
                var isLeaf = (item.items) ? false : true;

                // Setup the item's element.
                var $item = null;
                if  (typeof item.content == 'string'){
                    $item = $('<span>' + item.content + '</span>');
                }
                else{
                    $item = $(item.content).clone(true);
                }

                // If it's a leaf, render it as a leaf.
                if (isLeaf){
                    $item.addClass('menu-item menu-leaf');
                    $itemContainer.append($item);
                }
                // Otherwise render the item as a menu.
                else{
                    $item.addClass('menu-item menu-subtitle');
                    $itemContainer.append($item);
                    $itemContainer.append(this.renderMenu(item, level + 1));
                }

                // Append the item to the menu.
                $menu.append($itemContainer);

            }, this);

            return $menu;
        },

        connectMenu: function($target, $menu, $container){
            var _this = this;

            // Create the tooltip menu.
            $target.qtip({
                overwrite: false,
                content: { 
                    text: $menu,
                    prerender: true
                },
                position: {
                    container: $container,
                    my: 'top left',
                    at: 'bottom left'
                },
                show: {
                    event: "click"
                },
                hide: {
                    delay: 100,
                    event: 'unfocus',
                    fixed: true
                },
                style: {
                    classes: 'tooltip-menu-tooltip',
                    tip: false
                },
                events: {
                    render: function(event, api) {
                        // Toggle main menu when target is clicked.
                        $(api.elements.target).on('click', function(clickEvent){
                            // Stop propagation.
                            clickEvent.stopPropagation();
                            clickEvent.stopImmediatePropagation();

                            // Toggle the menu.
                            api.toggle();
                        });

                        // Hide menu and trigger selected when leaf is clicked.
                        $('.menu-leaf', _this.$menuContainer).on('click', function(clickEvent){
                            // Stop propagation.
                            clickEvent.stopPropagation();
                            clickEvent.stopImmediatePropagation();

                            // Hide the tooltip. 
                            api.hide(clickEvent);
                        });

                        // Connect menu items.
                        _this.connectMenuItems($menu);

                    },
                    // Hide submenus when the top menu is hidden.
                    hide: function(event, api) {
                        var oEvent = event.originalEvent || event;
                        $('.menu-subtitle', api.elements.target).qtip('hide', oEvent);
                    }
                }
            });
        },

        connectMenuItems: function($menu){

            _.each($('.menu-item', $menu), function(menuEl){
                var $self = $(menuEl);

                // Get parent and parent container.
                var $parentMenu = $self.closest('.menu');
                var $parentContainer = $parentMenu.parent();

                // If we can't find a sub-menu... return
                var $submenu = $self.next('ul');
                if(! $submenu.length) {
                    return false; 
                }

                // Create the tooltip menu.
                $self.qtip({
                    overwrite: false,
                    content: { 
                        text: $submenu
                    },
                    position: {
                        container: $parentMenu,
                        my: 'top left',
                        at: 'top right',
                    },
                    show: {
                        event: "mouseover",
                        solo: $parentContainer
                    },
                    hide: {
                        delay: 100,
                        event: 'unfocus',
                        fixed: true
                    },
                    style: {
                        classes: 'tooltip-menu-tooltip',
                        tip: false
                    },
                    events: {
                        render: function(event, api) {
                            // Hide when other items in the parent menu are mouse-overed.
                            $('> li >.menu-item', $parentMenu).on('mouseover', function(mouseOverEvent){
                                if (! $(mouseOverEvent.target).is(api.elements.target)){
                                    api.hide();
                                }
                            });
                        },
                    }
                });
            });
        }

	});

	return TooltipMenuView;
});
		

