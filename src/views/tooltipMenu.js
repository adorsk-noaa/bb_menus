define([
	"jquery",
	"backbone",
	"underscore",
	"ui",
	"qtip"
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
            var $menu = $('<div class="menu"></div>');

            // For each menu item...
            _.each(menuDef.items, function(item){

                // Initialize item container.
                var $itemContainer = $('<div class="menu-item"></div>');

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
                    $itemContainer.addClass('menu-item menu-leaf');
                }
                // Otherwise render the item as a menu.
                else{
                    $itemContainer.addClass('menu-subtitle');
                    $itemContainer.append('<span class="arrow">&#x25B6;</span>');
                    $itemContainer.append(this.renderMenu(item, level + 1));
                }
                $itemContainer.append($item);

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
                    my: 'top left',
                    at: 'bottom left',
                    adjust: {
                        y: 2,
                    }
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
                        $('.menu-leaf', api.elements.tooltip).on('click', function(clickEvent){
                            // Stop propagation.
                            clickEvent.stopPropagation();
                            clickEvent.stopImmediatePropagation();

                            // Hide the tooltip. 
                            api.hide(clickEvent);
                        });

                        // Connect submenus.
                        _this.connectSubMenus($menu);

                    },
                    // Hide submenus when the top menu is hidden.
                    hide: function(event, api) {
                        var oEvent = event.originalEvent || event;
                        $('.menu-subtitle', api.elements.tooltip).qtip('hide', oEvent);
                    }
                }
            });
        },

        connectSubMenus: function($menu){

            _.each($('.menu-item', $menu), function(menuEl){
                var $self = $(menuEl);

                // Get parent and parent container.
                var $parentMenu = $self.closest('.menu');
                var $parentContainer = $parentMenu.parent();

                // If we can't find a sub-menu... return
                var $submenu = $self.children('.menu');
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
                        target: $parentMenu.closest('.tooltip-menu-tooltip'),
                        my: 'top left',
                        at: 'top right',
                        adjust: {
                            x: -2
                        }
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
                            $('> .menu-item', $parentMenu).on('mouseover', function(mouseOverEvent){
                                var $target = $(mouseOverEvent.target);
                                if (! $target.is(api.elements.target) && ! api.elements.target.find($target).length){
                                    api.hide(mouseOverEvent);
                                }
                            });
                        },

                        hide: function(event, api){
                            api.elements.target.removeClass('expanded');
                        },

                        show: function(event, api){
                            api.elements.target.addClass('expanded');
                        }
                    }
                });
            });
        }

	});

	return TooltipMenuView;
});
		

