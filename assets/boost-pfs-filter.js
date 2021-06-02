// Override Settings
var boostPFSFilterConfig = {
	general: {
		limit: boostPFSConfig.custom.products_per_page,
		// Optional
		loadProductFirst: true,
		//paginationType: boostPFSConfig.custom.endless_scroll ? 'infinite' : 'default',
		trackingProduct: '.boost-pfs-filter-products .product-item',
		trackingQuickView: '.trigger-quick-view ',
		trackingAddToCart: '.add-js.product__submit__add',
		trackingBuyNow: '.shopify-payment-button, #dynamic-checkout-cart'
	}
};

var isFirstLoad = true;

var boostPFSTemplate = {
	// Grid Template
	productGridItemHtml:  	'<div class="product-item {{itemGridClass}}">' +
  								
								'<a class="product-link" href="{{itemUrl}}" id="product-{{itemId}}">' +                                  
									'<div class="product-item__image {{itemHoverClass}}">' +
										'{{itemImages}}' +
										'{{itemQuickViewBtn}}' +
									'</div>' +
									'<div class="product-information">' +
  										/*
										 '{{itemReviews}}' + 
                                         */
										'<p class="product__grid__title">{{itemTitle}}</p>' +
										'{{itemPrice}}' +									
									'</div>' +
  										'<div class="virtooal-tryon-btn-collection-corner-wrapper">' +
                                    	'<button type="button" class="virtooal-tryon-btn virtooal-tryon-btn-collection-page virtooal-tryon-btn-corner" data-virtooal_id="{{itemFirstVariantId}}">Try On</button>' +
                                    	'</div>' +
								'</a>' +
							'</div>' +
							'{{itemQuickView}}',

	// Pagination Template
	previousActiveHtml: '<span class="prev-page"><a href="{{itemUrl}}" title="">&larr;</a></span>',
	previousDisabledHtml: '',
	nextActiveHtml: '<span class="next-page"><a href="{{itemUrl}}" title="">&rarr;</a></span>',
	nextDisabledHtml: '',
	pageItemHtml: '<span class="curr-page"><a href="{{itemUrl}}" title="">{{itemTitle}}</a></span>',
	pageItemSelectedHtml: '<span class="current">{{itemTitle}}</span>',
	pageItemRemainHtml: "<span>{{itemTitle}}</span>",
	paginateHtml: '<div class="pagination">{{previous}}{{pageItems}}{{next}}</div>',
	// Sorting Template
  sortingHtml: '<label for="boost-pfs-sorting-select">Sort by: </label><select id="boost-pfs-sorting-select">{{sortingItems}}</select>'
  
};


(function () { 
	BoostPFS.inject(this);
	ProductGridItem.prototype.compileTemplate = function(data,index,totalProduct) {
		
		if (!data) data = this.data;  
		if (!index) index = this.index;  
		if (!totalProduct) totalProduct = this.totalProduct;  
		/*** Prepare data ***/
		var images = data.images_info;
		var soldOut = !data.available; // Check a product is out of stock
		var onSale = data.compare_at_price_min > data.price_min; // Check a product is on sale
		var priceVaries = data.price_min != data.price_max; // Check a product has many prices
		/*** End Prepare data ***/

		// Get Template
		var itemHtml = boostPFSTemplate.productGridItemHtml;

		// Add custom class
		var itemGridClass = "";
		switch (boostPFSConfig.custom.products_per_row) {
		case 2:
			itemGridClass = "small--one-half medium--one-half large-up--one-half";
			break;
		case 3:
			itemGridClass = "small--one-half medium--one-third large-up--one-third";
			break;
		case 4:
			itemGridClass = "small--one-half medium--one-half large-up--one-quarter";
			break;
		case 5:
			itemGridClass = "small--one-half medium--one-third large-up--one-fifth";
			break;
		default:
			itemGridClass = "small--one-half medium--one-third large-up--one-sixth";
			break;
		}
		itemHtml = itemHtml.replace(/{{itemGridClass}}/g, itemGridClass);

		// Add price
		var itemPriceHtml = '';
		if (onSale) {
			itemPriceHtml += '<span class="price sale">';
		} else {
			itemPriceHtml += '<span class="price">';
		}
		if (!soldOut) {
		if (onSale) {
			itemPriceHtml += '<span class="old-price">' + Utils.formatMoney(data.compare_at_price_min, Globals.moneyFormat) + '</span>';
		}
		if (priceVaries) {
			itemPriceHtml += '<small>' + boostPFSConfig.label.from + '</small> ';
			itemPriceHtml += Utils.formatMoney(data.price_min, Globals.moneyFormat);
		} else {
			itemPriceHtml += Utils.formatMoney(data.price_min, Globals.moneyFormat);
		}
		} else {
			itemPriceHtml += '<span class="sold-out">' + boostPFSConfig.label.sold_out + '</span>';
		}

		itemPriceHtml += '</span>';
		itemHtml = itemHtml.replace(/{{itemPrice}}/g, itemPriceHtml);

		// Add item Images
		var itemImagesHtml = '';
		var itemHoverClass = images.length > 1 && boostPFSConfig.custom.image_hover_enable ? 'double__image' : '';
		var animation = (index - 1) % boostPFSConfig.custom.grid_int;
		var dataBgset = images.length > 0 ? bgset(images[0]) : boostPFSConfig.general.no_image_url;
		itemImagesHtml += '<div class="product-item__bg lazyload" ' +
							'data-aos="img-in" ' +
							'data-aos-anchor=".product-grid" ' +
							'data-aos-delay="{{animationDelay}}" ' +
							'data-aos-duration="{{animationDuration}}" ' +
							'data-aos-easing="ease-out-quart" ' +
							'data-bgset="' + dataBgset + '">';
		itemImagesHtml += '</div>';
		if (images.length > 1 && boostPFSConfig.custom.image_hover_enable) {
			itemImagesHtml += '<div class="product-item__bg__under lazyload" data-bgset="' + bgset(images[1]) + '"></div>';
		}
		itemHtml = itemHtml.replace(/{{itemHoverClass}}/g, itemHoverClass);
		itemHtml = itemHtml.replace(/{{itemImages}}/g, itemImagesHtml);
		itemHtml = itemHtml.replace(/{{animationDelay}}/g, animation * 150);
		itemHtml = itemHtml.replace(/{{animationDuration}}/g, animation * 100 + 800);

		// Add Thumbnail
		var itemThumbUrl = images.length > 0 ? Utils.optimizeImage(images[0]["src"], "500x") : boostPFSConfig.general.no_image_url;
		itemHtml = itemHtml.replace(/{{itemThumbUrl}}/g, itemThumbUrl);

		// Add Reviews
// 		var itemReviews = '';
// 		if (boostPFSConfig.custom.enable_reviews){
// 		if (boostPFSConfig.custom.enable_yotpo && boostPFSConfig.custom.yotpo_ID){
// 			itemReviews = '<div class="yotpo bottomLine" data-product-id="{{itemId}}"></div>';
// 		} else {
// 			itemReviews = '<span class="shopify-product-reviews-badge" data-id="{{itemId}}"></span>';
// 		}
// 		}
      
      
      	// Add Loox rating
        var avg_rating = Utils.getProductMetafield(data, 'loox', 'avg_rating');
        var num_reviews = Utils.getProductMetafield(data, 'loox', 'num_reviews');
        var itemReviews = '';
        if (avg_rating !== null && num_reviews !== null) {
            itemReviews = '<div class="loox-rating" data-id="{{itemId}}" data-rating="'+avg_rating+'" data-raters="'+num_reviews+'"></div>';
        }
		itemHtml = itemHtml.replace(/{{itemReviews}}/g, itemReviews);
        

		// Add QuickView
		var itemQuickViewHtml = '';
		var itemQuickViewBtnHtml = '';
		if (onSale) {
			itemQuickViewBtnHtml += '<span class="sale-box">' + boostPFSConfig.label.sale + '</span>';
		}
		if (boostPFSConfig.custom.quickview_enable) {
			itemQuickViewBtnHtml += '<div class="slideup">';
          	itemQuickViewBtnHtml += '<button type="button" class="virtooal-tryon-btn virtooal-tryon-btn-collection-page virtooal-tryon-btn-slideup" data-virtooal_id="' + data.variants[0].id + '">try on</button>'
			//itemQuickViewBtnHtml += '<span data-modal="Product' + (index - 1) + '' + parseInt(Globals.queryParams.page) + '-collection" class="trigger-quick-view caps">' + boostPFSConfig.label.quick_view + '</span>';
			itemQuickViewBtnHtml += '</div>';

// 			itemQuickViewHtml += '<div class="modal__overlay quicklook" id="Product' + (index - 1) + '' + parseInt(Globals.queryParams.page) + '-collection">';
// 			itemQuickViewHtml += '<section data-boost-theme-quickview="{{itemId}}" class="modal__outer">';
// 			itemQuickViewHtml += '</section>';
// 			itemQuickViewHtml += '</div>';
		}
		itemHtml = itemHtml.replace(/{{itemQuickView}}/g, itemQuickViewHtml);
		itemHtml = itemHtml.replace(/{{itemQuickViewBtn}}/g, itemQuickViewBtnHtml);

		// Add main attribute
		itemHtml = itemHtml.replace(/{{itemId}}/g, data.id);
      	itemHtml = itemHtml.replace(/{{itemFirstVariantId}}/g, data.variants[0].id);
      	
		itemHtml = itemHtml.replace(/{{itemTitle}}/g, data.title);
		itemHtml = itemHtml.replace(/{{itemUrl}}/g, Utils.buildProductItemUrl(data , false));

		return itemHtml;
	};

	function bgset(image) {
		var bgset = '';
		if (image) {
			var aspect_ratio = image.width / image.height;

			if (image.width > 180) bgset += ' ' + Utils.optimizeImage(image.src, '180x') + ' 180w ' + Math.round(180 / aspect_ratio) + 'h,';
			if (image.width > 360) bgset += ' ' + Utils.optimizeImage(image.src, '360x') + ' 360w ' + Math.round(360 / aspect_ratio) + 'h,';
			if (image.width > 540) bgset += ' ' + Utils.optimizeImage(image.src, '540x') + ' 540w ' + Math.round(540 / aspect_ratio) + 'h,';
			if (image.width > 720) bgset += ' ' + Utils.optimizeImage(image.src, '720x') + ' 720w ' + Math.round(720 / aspect_ratio) + 'h,';
			if (image.width > 900) bgset += ' ' + Utils.optimizeImage(image.src, '900x') + ' 900w ' + Math.round(900 / aspect_ratio) + 'h,';
			if (image.width > 1080) bgset += ' ' + Utils.optimizeImage(image.src, '1080x') + ' 1080w ' + Math.round(1080 / aspect_ratio) + 'h,';
			if (image.width > 1296) bgset += ' ' + Utils.optimizeImage(image.src, '1296x') + ' 1296w ' + Math.round(1296 / aspect_ratio) + 'h,';
			if (image.width > 1512) bgset += ' ' + Utils.optimizeImage(image.src, '1512x') + ' 1512w ' + Math.round(1512 / aspect_ratio) + 'h,';
			if (image.width > 1728) bgset += ' ' + Utils.optimizeImage(image.src, '1728x') + ' 1728w ' + Math.round(1728 / aspect_ratio) + 'h,';
			if (image.width > 1950) bgset += ' ' + Utils.optimizeImage(image.src, '1950x') + ' 1950w ' + Math.round(1950 / aspect_ratio) + 'h,';
			if (image.width > 2100) bgset += ' ' + Utils.optimizeImage(image.src, '2100x') + ' 2100w ' + Math.round(2100 / aspect_ratio) + 'h,';
			if (image.width > 2260) bgset += ' ' + Utils.optimizeImage(image.src, '2260x') + ' 2260w ' + Math.round(2260 / aspect_ratio) + 'h,';
			if (image.width > 2450) bgset += ' ' + Utils.optimizeImage(image.src, '2450x') + ' 2450w ' + Math.round(2450 / aspect_ratio) + 'h,';
			if (image.width > 2700) bgset += ' ' + Utils.optimizeImage(image.src, '2700x') + ' 2700w ' + Math.round(2700 / aspect_ratio) + 'h,';
			if (image.width > 3000) bgset += ' ' + Utils.optimizeImage(image.src, '3000x') + ' 3000w ' + Math.round(3000 / aspect_ratio) + 'h,';
			if (image.width > 3350) bgset += ' ' + Utils.optimizeImage(image.src, '3350x') + ' 3350w ' + Math.round(3350 / aspect_ratio) + 'h,';
			if (image.width > 3750) bgset += ' ' + Utils.optimizeImage(image.src, '3750x') + ' 3750w ' + Math.round(3750 / aspect_ratio) + 'h,';
			if (image.width > 4100) bgset += ' ' + Utils.optimizeImage(image.src, '4100x') + ' 4100x ' + Math.round(4100 / aspect_ratio) + 'h,';
			bgset += ' ' + image.src + ' ' + image.width + 'w ' + image.height + 'h,';
		}
		return bgset;
	}

	ProductPaginationDefault.prototype.compileTemplate = function(totalProduct) {
		if(!totalProduct) totalProduct = this.totalProduct;
		var html = "";
		// Get page info
		var currentPage = parseInt(Globals.queryParams.page);
		var totalPage = Math.ceil(totalProduct / Globals.queryParams.limit);

		if (totalPage > 1) {
			var paginationHtml = boostPFSTemplate.paginateHtml;
			// Build Previous
			var previousHtml = currentPage > 1 ? boostPFSTemplate.previousActiveHtml : boostPFSTemplate.previousDisabledHtml;
			previousHtml = previousHtml.replace(/{{itemUrl}}/g, Utils.buildToolbarLink("page", currentPage, currentPage - 1));
			paginationHtml = paginationHtml.replace(/{{previous}}/g, previousHtml);
			// Build Next
			var nextHtml = currentPage < totalPage ? boostPFSTemplate.nextActiveHtml : boostPFSTemplate.nextDisabledHtml;
			nextHtml = nextHtml.replace(/{{itemUrl}}/g, Utils.buildToolbarLink("page", currentPage, currentPage + 1));
			paginationHtml = paginationHtml.replace(/{{next}}/g, nextHtml);
			// Create page items array
			var beforeCurrentPageArr = [];
			for (var iBefore = currentPage - 1; iBefore > currentPage - 3 && iBefore > 0; iBefore--) {
				beforeCurrentPageArr.unshift(iBefore);
			}
			if (currentPage - 4 > 0) {
				beforeCurrentPageArr.unshift("...");
			}
			if (currentPage - 4 >= 0) {
				beforeCurrentPageArr.unshift(1);
			}
			beforeCurrentPageArr.push(currentPage);
			var afterCurrentPageArr = [];
			for (var iAfter = currentPage + 1; iAfter < currentPage + 3 && iAfter <= totalPage; iAfter++) {
				afterCurrentPageArr.push(iAfter);
			}
			if (currentPage + 3 < totalPage) {
				afterCurrentPageArr.push("...");
			}
			if (currentPage + 3 <= totalPage) {
				afterCurrentPageArr.push(totalPage);
			}
			// Build page items
			var pageItemsHtml = "";
			var pageArr = beforeCurrentPageArr.concat(afterCurrentPageArr);
			for (var iPage = 0; iPage < pageArr.length; iPage++) {
				if (pageArr[iPage] == "...") {
					pageItemsHtml += boostPFSTemplate.pageItemRemainHtml;
				} else {
					pageItemsHtml += pageArr[iPage] == currentPage ? boostPFSTemplate.pageItemSelectedHtml : boostPFSTemplate.pageItemHtml;
				}
				pageItemsHtml = pageItemsHtml.replace(/{{itemTitle}}/g, pageArr[iPage]);
				pageItemsHtml = pageItemsHtml.replace(/{{itemUrl}}/g, Utils.buildToolbarLink("page", currentPage, pageArr[iPage]));
			}
			html = paginationHtml.replace(/{{pageItems}}/g, pageItemsHtml);
		}
		
		return html;
	};

	ProductPaginationLoadMore.prototype.compileTotalTemplate = function() {
		/**
		 * If enable the Load previous feature and the evnet type is page:
		 * => Get the next loading page is from session storage OR get the next loading page from query param
		 */
		if (Utils.isLoadPreviousPagePaginationType() && this.parent.eventType == 'page') {
			this.nextPage = parseInt(window.sessionStorage.getItem(this.settings.sessionStorageCurrentNextPage));
		} else {
			this.nextPage = Globals.queryParams.page;
		}
		// Set from index
		var from = (this.nextPage - 1) * Globals.queryParams.limit + 1;
		var numberOfShowingProducts = jQ(Selector.products + ' > .product-item').length;
		if (numberOfShowingProducts) {
			from -= numberOfShowingProducts - Globals.queryParams.limit;
		}
		// Set to index
		var product_index = (this.nextPage - 1) * Globals.queryParams.limit + 1;
		var to = product_index + this.data.products.length - 1;

		return this.getTemplate('total')
			.replace(/{{progressLable}}/g, Labels.loadMoreTotal)
			.replace(/{{ from }}/g, from)
			.replace(/{{ to }}/g, to)
			.replace(/{{ total }}/g, this.totalProduct)
			.replace(/{{class.productLoadMore}}/g, Class.productLoadMore)
	}

	// Build Sorting
	ProductSorting.prototype.compileTemplate = function() {
		var html = '';
		if (boostPFSTemplate.hasOwnProperty("sortingHtml")) {
			var sortingArr = Utils.getSortingList();
			if (sortingArr) {
				// Build content
				var sortingItemsHtml = "";
              	sortingItemsHtml += '<option value="manual" hidden>Featured</option>';
				for (var k in sortingArr) {
				sortingItemsHtml += '<option value="' + k + '">' + sortingArr[k] + "</option>";
				}
				html = boostPFSTemplate.sortingHtml.replace(/{{sortingItems}}/g, sortingItemsHtml);
				html = html.replace(/{{itemLabelActive}}/g, sortingArr[Globals.queryParams.sort]);

			}
		}
		return html;
	};

	// Add additional feature for product list, used commonly in customizing product list
	ProductList.prototype.afterRender = function(data, eventType) {
		if (!data) data = this.data;
		if (!eventType) eventType = this.eventType;
		// Call function to get extra product html by ajax
		if (boostPFSConfig.custom.quickview_enable) {
		var sections = new slate.Sections();
		this.buildExtrasProductListByAjax(data, "boost-pfs-integration", function(results){
			results.forEach(function(result, index){
			// Append the custom html to product item
			jQ('[data-boost-theme-quickview="'+ result.id+ '"]').html(result.quickview_html);
			if(index == results.length -1){
				sections.register('collection', [theme.Collection, theme.ProductGrid, theme.Hero]);
				window.Shopify.PaymentButton.init();
			}
			})
		})
		}
      
      	
	};
	// Build additional elements
	FilterResult.prototype.afterRender = function(data) {
		if (!data) data = this.data;
      
      	var totalProducts = data.total_product;
      	if (totalProducts > 1) {
          jQ('.boost-pfs-total-products').html('Frames: ' + totalProducts);
        } else {
          jQ('.boost-pfs-total-products').html('Frame: ' + totalProducts);
        }
      
      	if (typeof virtooalRefreshBtns != 'undefined') { virtooalRefreshBtns(); }
      
        stickFilterTreeHorizontal('.collection__nav.collection__nav--sort', 0, '.boost-pfs-filter-products', 'bc-sf-filter-sticky-h');
	};
  
    function stickFilterTreeHorizontal(stickyId, stickyPosition, stickyElement, stickClass) {
    if(jQ(stickyId).length){
        var filterTreeHorizontal = jQ(stickyId);
        var setPosition = 10;
        if (stickyPosition != 0 && jQ(stickyPosition).length) {
            setPosition = jQ(stickyPosition).offset().top;
        }
        var setWidth = jQ(stickyElement).outerWidth();
        jQ(window).scroll(function(e) {
            var scrollTop = jQ(window).scrollTop();
            var filterPosition = jQ(stickyElement).offset().top;
            if (scrollTop >= filterPosition) {
                filterTreeHorizontal.addClass(stickClass);
                filterTreeHorizontal.css({
                  'top': Utils.isMobile() ? '50px' : '0px',
                  'width': '100%',
//                   'margin-left': '2.5%'
                });
            } else {
                filterTreeHorizontal.removeClass(stickClass);
                filterTreeHorizontal.css({
                    'top': '',
                    'width': '',
                    'margin-left': ''
                });
            }
        });
 
    }   
}
})(); 