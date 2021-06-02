const Ajax = {
  post: function(url, data) {
    return new Promise((resolve, reject) => {
      $.ajax({
        type: "POST",
        url,
        data,
        dataType: "json",
        success: function (response) {
          resolve(response)
        },
        error: function (error) {
          console.error(error);
          alert(error.responseJSON.description);
        }
      });
    })
  }
}
Ajax.addToCart = function(data) {
  return Ajax.post(routes.addCart + '.js', data);
}
Ajax.updateCart = function(data) {
  return Ajax.post(routes.updateCart + '.js', data);
}
Ajax.changeCart = function(data) {
  return Ajax.post(routes.changeCart + '.js', data);
}

Utils = {
  MessageBox: (message) => {
    const id = new Date().getTime();
    const html = /*html*/`
      <div id="message-box-${id}" class="message-box">
        <div class="message-box--modal" data-message-box-close></div>
        <div class="message-box--body">
          <button type="button" class="message-box--close-btn" data-message-box-close>
            <svg t="1621933584575" class="icon" viewBox="0 0 1025 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"><path d="M513.344 0a512 512 0 1 0 0 1024 512 512 0 0 0 0-1024z m226.048 674.624l-54.528 56.896-171.52-164.928-171.392 164.928-54.592-56.896L456.576 512 287.36 349.312l54.592-56.768 171.392 164.8 171.52-164.8 54.528 56.768L570.176 512l169.216 162.624z"></path></svg>
          </button>
          <div class="message-box--content">
            ${message}
          </div>
          <div class="message-box--footer">
            <button type="button" class="message-box--btn" data-message-box-close>Got it, thanks!</button>
          </div>
        </div>
      </div>
    `;
    $("body").append(html);
    $(`#message-box-${id}`).find("[data-message-box-close]").click(function (e) { 
      e.preventDefault();
      $(`#message-box-${id}`).remove();
    });
  }
}
// Cart
class Cart {
  constructor() {
    this.data = null;
    this.$items = null;
    this.$cart = $("#shopify-section-cart > .cart");
    this.emptyHtml = $("#cart-empty-html").html();
    this._init();
  }
  _init() {
    this.data = JSON.parse($("#cart-json").html())
    this._updateCartCount()
    this._initCartPage()
  }
  _initCartPage() {
    const _this = this;
    if (request.pageType !== 'cart') return false;
    // 渲染数据
    this._updateCartItems();
  }
  _updateCartCount() {
    let count = 0;
    this.data.items.forEach(item => {
      if (item.product_type.toLowerCase() !=='lens') {
        count += item.quantity;
      }
    });
    $("[data-cart-count]").html(count);
  }
  _updateCartItems() {
    const _this = this;
    if (this.data.items.length === 0) {
      this.$cart.html(this.emptyHtml);
      return;
    }
    this.$items = $("#cart-items");
    this.$items.html('');
    this.data.items.forEach((item, index) => {
      _this._addCartItemHtml(item, index)
    });
    $("[data-cart-total-price]").text(theme.Currency.formatMoney(this.data.total_price));
    this._updateCartCount();
  }
  _addCartItemHtml(item, index) {
    if (item.product_type.toLowerCase() === 'lens') return false;
    let lens = null;
    if (item.properties && typeof item.properties._lens_id !== 'undefined') {
      lens = {
        id: item.properties._lens_id,
        price: item.properties._lens_price ? item.properties._lens_price * 1 : 0,
        infos: item.properties._lens_infos ? JSON.parse(item.properties._lens_infos) : null,
        prescription: item.properties._lens_prescription ? JSON.parse(item.properties._lens_prescription) : null,
      }
    }
    let html = /*html*/`
      <div class="cart-item" data-cart-item-key="${item.key}">
        <div class="cart-item-left">
          <div class="img-wrap">
            <img src="${item.image}">
          </div>
        </div>
        <div class="cart-item-right">

          <div class="item-info-li">
            <h2 class="cart-item-title"><a href="${item.url}">${item.product_title}</a><span>${theme.Currency.formatMoney(item.price)}</span></h2>
            ${item.variant_title ? `<p>${item.variant_title}</p>` : ''}
          </div>

          ${lens ? this._getCartItemLensHtml(lens, item) : ''}

          ${this._getCartItemQtyHtml(item)}

          <div class="item-info-li item-info-lr item-info-subtotal">
            <div class="item-info-li-name font-weight-bold">Subtotal:</div>
            <div class="item-info-li-content text-right font-weight-bold">
              <div class="cart-price">
                ${
                  lens
                  ? theme.Currency.formatMoney((lens.price + item.price) * item.quantity)
                  : theme.Currency.formatMoney(item.line_price)
                }
              </div>
            </div>
          </div>

          <div class="item-info-li cart-item-utils">
            <a href="javascript:void(0);" class="cart-item-util cart-item-remove" data-click-cart-item-remove>
              <svg t="1621246031739" class="svg-icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"><path d="M859.97188741 92.22438979H710.84107852v-77.32708609H313.15892148v77.32708609H14.8973037v77.32708609h110.46726585v800.88767737a38.66354305 38.66354305 0 0 0 38.66354304 38.66354305h695.94377482a38.66354305 38.66354305 0 0 0 38.66354304-38.66354305V169.55147588h110.46726585v-77.32708609H859.97188741zM821.30834435 931.77561021H202.69165565V169.55147588h618.6166887v762.22413433z" fill="" p-id="1379"></path><path d="M346.29910124 313.15892148h77.32708608v497.1026963h-77.32708608zM600.37381268 313.15892148h77.32708608v497.1026963h-77.32708608z"></path></svg>
              <span>Remove</span>
            </a>
          </div>

        </div>
      </div>
    `;
    this.$items.append(html);
    const $item = $(`.cart-item[data-cart-item-key="${item.key}"]`);
    this._cartItemEvent($item, item, lens, index);
  }
  _getCartItemLensHtml(lens, item) {
    let headHtml = /*html*/`
      <div class="item-info-lr item-lens-head">
        <div class="name" data-click-cart-lens-content-switch>
          ${lens.infos[0].name}
          <svg t="1609654075908" class="icon icon-up" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"><path d="M512 281.002667l-374.528 374.528 60.330667 60.330666 314.453333-313.984 310.912 310.954667 60.330667-60.330667z"></path></svg>
        </div>
        <div class="value">
          ${theme.Currency.formatMoney(lens.price)}
        </div>
      </div>
    `;
    let html = '';
    // 处方
    html += this._getCartItemPrescriptionHtml(lens.prescription);

    lens.infos.forEach(info => {
      html += /*html*/`
        <div class="item-lens-info item-info-lr">
          <div class="name">
            ${info.name}
          </div>
          <div class="value">
            ${info.value}
          </div>
        </div>
      `;
    });

    return /*html*/`
      <div class="item-info-li item-info-lr item-info-lens">
        <div class="item-info-li-name">Lens:</div>
        <div class="item-info-li-content">
          ${headHtml}
          <div class="item-info-lens-content" style="display: none;">
            ${html}
          </div>
        </div>
      </div>
    `;
  }
  _getCartItemPrescriptionHtml(prescription) {
    let html = '';
    switch (prescription.id) {
      case 1:
      case 2:
        const _p = prescription.data;
        const _parr = [];
        html += /*html*/`<li><div class="p_title"></div><div class="p_od">OD</div><div class="p_os">OS</div></li>`;
        _p.forEach(item => {
          _parr[item.name] = item.value;
        });
        _p.forEach(item => {
          const name = item.name;
          if (name.indexOf('_') === -1) {
            html += /*html*/`<li><div class="p_title">${name}</div><div style="line-height: 4rem;height: 4rem;" data-name="${name}">${item.value}</div></li>`;
          } else {
            const _arr = name.split('_');
            const _s = _arr[0];
            const _n = _arr[1];
            if (_s === 'od') {
              const _od = `od_${_n}`;
              const _os = `os_${_n}`;
              const _odv = _parr[_od];
              const _osv = _parr[_os];
              html += /*html*/`<li><div class="p_title">${_n}</div><div data-name="${_od}">${_odv}</div><div data-name="${_os}">${_osv}</div></li>`;
            }
          }
        });
        html = /*html*/`
          <ul class="cart-item-prescription">${html}</ul>
        `;
        break;
    
      default:
        break;
    }
    return html;
  }
  _getCartItemQtyHtml(item) {
    const qty = item.quantity;
    let start = qty - 5;
    if (start < 1) start = 1;
    let end = qty + 5;
    let html = '';
    for (let i = start; i <= end; i++) {
      html += /*html*/`<option value="${i}" ${ qty === i ? 'selected' : ''}>${i}</option>`;
    }
    return /*html*/`
    <div class="item-info-li item-info-lr item-info-qty">
      <div class="item-info-li-name">Qty:</div>
      <div class="item-info-li-content">
        <select class="cart-item-qty-select" data-cart-item-qty-select>${html}</select>
      </div>
    </div>
    `;
  }
  _cartItemEvent($item, item, lens, index) {
    const _this = this;
    $item.find("[data-click-cart-lens-content-switch]").click(function (e) { 
      e.preventDefault();
      if ($item.find(".item-lens-head").hasClass('active')) {
        $item.find(".item-lens-head").removeClass('active');
        $item.find(".item-info-lens-content").slideUp();
      } else {
        $item.find(".item-lens-head").addClass('active')
        $item.find(".item-info-lens-content").slideDown();
      }
    });
    
    $item.find("[data-cart-item-qty-select]").change(function (e) { 
      e.preventDefault();
      const qty = $(this).val() * 1;
      if (qty !== item.quantity) {
        _this._updateCartItemQty(qty, $item, item, lens, index);
      }
    });

    $item.find("[data-click-cart-item-remove]").click(function (e) { 
      e.preventDefault();
      _this._updateCartItemQty(0, $item, item, lens, index);
    });

  }
  async _updateCartItemQty(qty, $item, item, lens, index) {
    const updates = [];
    let time = null;
    if (lens) {
      time = item.properties._time; 
    }
    let old_qty = null;
    this.data.items.forEach((_item, _index) => {
      if (time) {
        if (_item.properties && _item.properties._time === time) {
          old_qty = _item.quantity;
          updates.push(qty)
        } else {
          updates.push(_item.quantity)
        }
      } else {
        if (_index === index) {
          old_qty = _item.quantity;
          updates.push(qty)
        } else {
          updates.push(_item.quantity)
        }
      }
    });
    try {
      this.data = await Ajax.updateCart({updates});
      this._initCartPage()
    } catch (error) {
      if (!old_qty) return;
      $item.find("[data-cart-item-qty-select]").val(old_qty);
    }
  }
}
const myCart = new Cart();
/* 配镜实例 */
class Lenses {
  constructor(id, product) {
    this.id = id;
    this.product = product;
    this.lensesData = window.lenses.data;
    this.variants = {};
    this.selected_variant = null;
    this.$lenses = null;
    this.history = [];
    this.cursor = 0;
    this.isHistory = true;
    this.prescription = [];
    this.prescriptionId = 0;
    this.top = $("#shopify-section-header .header__content").height();
    this._init();
  }

  _init() {
    this._initInfo();
    const wrapperHtml = this._wrapperHtml();
    this._initBodyAndHeader();
    $('body').append(wrapperHtml);
    this.$lenses = $(`#lenses-${this.id}`);
    this._lensesInfoHtml();
    this._lensesSelectHtml();

    this._updateLensesSelect(this.lensesData.select);

    this._initEvent();

  }
  // 初始化信息
  _initInfo() {
    /* 数据处理 */
    let medias__position = [];
    this.product.variants.forEach(v => {

      this.variants[v.id] = {};

      if (v.featured_image) {
        const p = v.featured_image.position;
        if (medias__position.indexOf(p) === -1) {
          if (medias__position.length === 0) {
            medias__position.push(p)
          } else  {
            for (let i = medias__position.length - 1; i > -1; i--) {
              const imgp = medias__position[i];
              if (imgp < p) {
                medias__position.splice(i+1, 0, p);
                break;
              } else if (i===0) {
                medias__position.splice(0, 0, p);
                break;
              }
            }
          }
        }
      }
    
      if (v.id == this.id) {
        this.selected_variant = v;
      }
    });

    this.product.variants.forEach((v, i) => {
      this.variants[v.id].medias = (() => {
        if (v.featured_image) {
          const p = v.featured_image.position;
          const pi = medias__position.indexOf(p);
          if (pi + 1 !== medias__position.length) {
            return this.product.media.slice(p - 1, medias__position[pi + 1] - 1);
          } else {
            return this.product.media.slice(p - 1)
          }
        } else {
          return this.product.media;
        }
      })()
    });
  }
  // 
  _initBodyAndHeader() {
    $('html, body').addClass("lenses")
  }
  // 初始化事件
  _initEvent() {
    const _this = this;
    this.$lenses.find("[data-click-lenses-close]").click(function (e) { 
      e.preventDefault();
      _this.closeLenses();
    });
  }
  closeLenses() {
    this.$lenses.remove();
    $('html, body').removeClass("lenses")
  }
  /* 获取图片 */
  getImagesByVariantId() {
    const medias = this.variants[this.selected_variant.id].medias;
    const images = [];
    medias.forEach(media => {
      if (media.media_type === "image") {
        images.push(media)
      }
    });
    return images;
  }
  /* Lenses 容器 HTML */
  _wrapperHtml() {
    return /*html*/`
      <div id="lenses-${this.id}" class="lenses__wrapper" style="top: ${this.top}px; height: calc(100% - ${this.top}px)">
        <div class="lenses__content">
          <div class="lenses-info__wrapper" data-lenses-info></div>
          <div class="lenses-select__wrapper" data-lenses-select></div>
          <div class="lenses-back-to-frame" data-click-lenses-close>< Back to Frame Description</div>
        </div>
      </div>
    `;
  }
  /* Lenses 信息区域（左边）HTML */
  _lensesInfoHtml() {
    const images = this.getImagesByVariantId();
    let imagesHtml = '';
    images.forEach((image, index) => {
      imagesHtml += /*html*/`
        <div class="lenses-info__product-images-item ${index === 0 ? 'active' : ''}">
          <img class="lazyload" data-src="${image.src}">
        </div>
      `;
    });

    const html = /*html*/`
      <div class="lenses-info">
        <div class="lenses-info__product-images">
          ${imagesHtml}
        </div>
        <div class="lenses-info__product-text">
          <div class="lenses-info__product-title">${this.product.title}</div>
          <div class="lenses-info__product-option">${this.selected_variant.title}</div>
          <div class="lenses-info__subtotal">Subtotal: 
            <span class="money lenses-info__subtotal-money" data-lenses-subtotal-price>
              ${theme.Currency.formatMoney(this.selected_variant.price)}
            </span>
          </div>
        </div>
      </div>
    `;
    this.$lenses.find("[data-lenses-info]").append(html)
  }
  /* Lenses 选择区域（右边）HTML */
  _lensesSelectHtml() {
    const _this = this;
    const html = /*html*/`
      <div class="lenses-select">
        <div class="lenses-select__head">
          <div class="lenses-select__to-prev" data-lenses-select-to-prev>
            <svg class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"><path d="M792.08054668 124.01660575V21.90013969A10.52069173 10.52069173 0 0 0 775.01730014 13.58221695L179.54613353 478.6954347a42.08276807 42.08276807 0 0 0 0 66.4118684l595.50404326 465.11321659a10.52069173 10.52069173 0 0 0 17.03036989-8.31792158v-102.11646722a21.37015572 21.37015572 0 0 0-8.05490493-16.63584433L308.45748674 512 784.02564175 140.65245008a21.37015572 21.37015572 0 0 0 8.05490493-16.63584433z"></path></svg>
          </div>
          <div class="lenses-select__to-next" data-lenses-select-to-next>
            <svg class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"><path d="M231.91945332 899.98339425L231.91945332 1002.09986031A10.52069173 10.52069173 0 0 0 248.98269986 1010.41778305L844.45386647 545.3045653a42.08276807 42.08276807 0 0 0 0-66.4118684l-595.50404326-465.11321659a10.52069173 10.52069173 0 0 0-17.03036989 8.31792158l0 102.11646722a21.37015572 21.37015572 0 0 0 8.05490493 16.63584433L715.54251327 512 239.97435825 883.34754992a21.37015572 21.37015572 0 0 0-8.05490493 16.63584433z"></path></svg>
          </div>
          <div class="lenses-select__title" data-lenses-select-title></div>
          
          <!-- 步骤条 -->
          ${this._getLensesSelectStepHtml()}

        </div>
        <div class="lenses-select__content" data-lenses-select-content></div>
      </div>
    `;
    this.$lenses.find('.lenses-select__wrapper').append(html);
    this.$lenses.find('[data-lenses-select-to-prev]').click(function (e) {
      _this._toPrev();
    });
    this.$lenses.find('[data-lenses-select-to-next]').click(function (e) {
      _this._toNext();
    })
  }
  /* 获取 步骤条 HTML */
  _getLensesSelectStepHtml() {
    const stepCount = this.lensesData.step_count;
    let html = '';
    for (let i = 1; i <= stepCount; i++) {
      if (i !== 1) {
        html += /*html*/`
          <li class="lenses-step-line" data-step="${i}"></li>
        `;
      }
      html += /*html*/`
        <li class="lenses-step-node" data-step="${i}">
          <svg class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"><path d="M179.10566128 526.8853411c0 0 120.25986135 111.02155609 207.82222834 240.02728253 178.32643559-297.35351065 452.71235357-460.41009824 452.71235357-460.41009824s22.53923795-70.69124543-25.24512688-46.67468857c0 0-194.70511697 81.83438223-443.72279801 303.94157905-84.97621472-81.95833521-134.17550051-102.40386025-134.17550053-102.40386028C174.97894843 431.62522947 179.10566128 526.8853411 179.10566128 526.8853411z"></path></svg>
        </li>
      `;
    }
    return /*html*/`
      <ul class="lenses-step">${html}</ul>
    `;
  }
  /* 更新 步骤条 */
  _updateLensesSelectStep(step) {
    for (let i = 0; i <= this.lensesData.step_count; i++) {
      if (i === step) {
        this.$lenses.find(`.lenses-step-line[data-step=${i}]`).attr('data-status', 'ing');
        this.$lenses.find(`.lenses-step-node[data-step=${i}]`).attr('data-status', 'ing');
      } else if (i < step) {
        this.$lenses.find(`.lenses-step-line[data-step=${i}]`).attr('data-status', 'ed');
        this.$lenses.find(`.lenses-step-node[data-step=${i}]`).attr('data-status', 'ed');
      } else {
        this.$lenses.find(`.lenses-step-line[data-step=${i}]`).attr('data-status', '');
        this.$lenses.find(`.lenses-step-node[data-step=${i}]`).attr('data-status', '');
      }
    }
    return step;
  }
  /* 添加记录 */
  _addHistory(data) {
    if (!this.isHistory) return false;
    if (this.cursor < this.history.length) {
      this.history.splice(this.cursor, this.history.length);
    }
    this.history.push(data);
    this.cursor++;
    this._updateHistoryNextStatus();
  }
  _updateHistoryNextStatus() {
    if (this.cursor < this.history.length) {
      $("[data-lenses-select-to-next]").show();
    } else {
      $("[data-lenses-select-to-next]").hide();
    }
  }
  /* 后退 */
  _toPrev() {
    if (this.cursor === 1) {
      this.closeLenses();
      return false;
    };
    this.isHistory = false;
    this.cursor = this.cursor - 1;
    const data = this.history[this.cursor - 1];
    this._toLensesSelectByData(data);
  }
  /* 前进 */
  _toNext() {
    if (this.cursor === this.history.length) return false;
    this.isHistory = false;
    this.cursor = this.cursor + 1;
    const data = this.history[this.cursor - 1];
    this._toLensesSelectByData(data);
  }
  _toLensesSelectByData(data) {
    this._updateHistoryNextStatus();
    switch (data.type) {
      case "options":
        this._updateLensesSelectOptions(data.select);
        break;
      case "prescription":
        this._toLensesSelectPrescription(data.option, data.select);
        break;
      case "detail":
        this._toLensesSelectDetail(data.option, data.select)
        break;

      default:
        break;
    }
  }
  /* 更新标题 */
  _updateLensesSelectTitle(title) {
    this.$lenses.find("[data-lenses-select-title]").html(title);
  }
  /* 更新 Lenses Select */
  _updateLensesSelect(select) {
    this._updateLensesSelectContent(select);
  }
  /* 更新标题或步骤 */
  _updateLensesSelectStepTitle(step, title) {
    if (title) this._updateLensesSelectTitle(title);
    if (step > -1) this._updateLensesSelectStep(step);
  }
  /* 更新 Lenses Select 内容 */
  _updateLensesSelectContent(select) {
    this._updateLensesSelectOptions(select);
  }
  /* 更新 内容 -- 选项 */
  _updateLensesSelectOptions(select) {
    const _this = this;
    this._addHistory({
      type: "options",
      select
    });
    
    _this._updateSubtotalPrice(select.price);
      
    const html = this._getLensesSelectOptionsHtml(select);
    this.$lenses.find('[data-lenses-select-content]').html(html);
    this._updateLensesSelectStepTitle(select.step, select.title);
    this.$lenses.find(".lenses-select-option").each(function (index, element) {
      const option = select.options[index];
      $(this).click(function(){
        _this.isHistory = true;
        if (option.prescription) {
          _this._toLensesSelectPrescription(option, select);
        } else if (option.lens) {
          _this._toLensesSelectDetail(option, select);
        } else {
          _this._updateLensesSelectOptions(option.select, option, select);
        }
        // 触发自定义事件
        $(document.body).trigger("lenses.option", [option, select]);
      });

    });
  }
  _updateSubtotalPrice(price) {
    const _this = this;
    // 更新价格
    let subtotalPrice = _this.selected_variant.price;
    if (price) {
      subtotalPrice += price;
    }
    $("[data-lenses-subtotal-price]").html(theme.Currency.formatMoney(subtotalPrice))
  }
  /* 获取选项 html */
  _getLensesSelectOptionsHtml(select) {
    let html = '';
    select.options.forEach(option => {
      html += /*html*/`
        <li class="lenses-select-option">
          <div class="lenses-select-option__icon">
            <img class="lazyload" data-src="${option.icon}">
          </div>
          <div class="lenses-select-option__text">
            <div class="lenses-select-option__name">${option.name}</div>
            <div class="lenses-select-option__desc">${option.desc}</div>
          </div>
        </li>
      `;
    });
    return /*html*/`
      <ul class="lenses-select-options">
        ${html}
      </ul>
    `;
  }
  /* 前往处方界面 */
  _toLensesSelectPrescription(option, select) {
    const _this = this;
    this._addHistory({
      type: "prescription",
      option,
      select
    })
    _this._updateSubtotalPrice(option.price);
    const prescription = this.lensesData.prescriptions[option.prescription - 1];
    this._updateLensesSelectStepTitle(prescription.step, prescription.title);
    let html = /*html*/`
      <form class="lenses-select-prescription lenses-select-prescription--form">
        <div class="lenses-select-prescription--row" data-lenses-select-prescription-content></div>
        <div class="lenses-select-prescription--row text-right">
          <button class="btn lenses-select-prescription-confirm lenses-select-button" type="button" data-lenses-select-prescription-confirm>Confirm</button>
        </div>
      </form>
    `;
    this.$lenses.find('[data-lenses-select-content]').html(html);
    this._updateLensesSelectPrescriptionContent(option.prescription);
    this.$lenses.find('[data-lenses-select-prescription-confirm]').click(function () {
      _this.isHistory = true;
      // 处方数据处理
      const $form = $(this).parents('form');

      if (["", "0.00"].indexOf($form.find("#od_cyl").val()) === -1) {
        if ($form.find("#od_axis").val() === "") {
          Utils.MessageBox("You choose CYL value, please add the Axis value");
          return false;
        }
      }
      if (["", "0.00"].indexOf($form.find("#os_cyl").val()) === -1) {
        if ($form.find("#os_axis").val() === "") {
          Utils.MessageBox("You choose CYL value, please add the Axis value");
          return false;
        }
      }

      if ($form.data("prescription-id") == 1) {
        // add 不能为空
        if ($form.find("#od_add").val() === "") {
          $form.find("#od_add").addClass("no");
          Utils.MessageBox("You selected Pregressive Lenses as primary use of your glasses, please input your ADD for the reading portion of your glasses");
          return false;
        }
        if ($form.find("#os_add").val() === "") {
          $form.find("#os_add").addClass("no");
          Utils.MessageBox("You selected Pregressive Lenses as primary use of your glasses, please input your ADD for the reading portion of your glasses");
          return false;
        }
      }
      
      let prescriptionArray = [];
      $form.find('select, input').each(function (index, element) {
        if ($(this).attr('name')) {
          if (['pd', 'od_pd', 'os_pd'].indexOf($(this).attr('name')) === -1 || !$(this).prop("disabled")) {
            prescriptionArray.push({
              name: $(this).attr('name'),
              value: $(this).val()
            });
          }
        }
      });
      _this.prescription = prescriptionArray;

      // 前往下一步
      _this._updateLensesSelectOptions(option.select, option, select);
       // 触发自定义事件
       $(document.body).trigger("lenses.prescriptionConfirm", [_this.prescription, option, select]);
    });
  }
  _updateLensesSelectPrescriptionContent(id) {
    const _this = this;
    _this.prescriptionId = id;
    let html = null;
    switch (id) {
      case 1:
      case 2:
        html = /*html*/`${$("#lenses-select-prescription-1").html()}`;
        this.$lenses.find('[data-lenses-select-prescription-content]').html(html);
        const $form = this.$lenses.find('form.lenses-select-prescription--form');
        $form.attr("data-prescription-id", id)
        if (id === 1) {
          $form.find(".js-rx-add").removeClass("rx-disabled");
          $form.find("#od_add").prop("disabled",false);
          $form.find("#os_add").prop("disabled",false);
        }
        if (id === 2) {
          $form.find(".js-rx-add").addClass("rx-disabled");
          $form.find("#od_add").val("").prop("disabled",true);
          $form.find("#os_add").val("").prop("disabled",true);
        }

        // 规则
        $form.find('#od_cyl, #os_cyl').change(function() {
          const name = $(this).attr('name');
          const value = $(this).val();
          if (value === "" || value === "0.00") {
            if (name === "od_cyl") {
              $form.find("#od_axis").prop("disabled",true).val("");
              if ($form.find("#os_cyl").val() === "" || $form.find("#os_cyl").val() === "0.00") {
                $form.find(".js-rx-axis").addClass("rx-disabled");
              }
            }
            if (name === "os_cyl") {
              $form.find("#os_axis").prop("disabled",true).val("");
              if ($form.find("#od_cyl").val() === "" || $form.find("#od_cyl").val() === "0.00") {
                $form.find(".js-rx-axis").addClass("rx-disabled");
              }
            }
          } else {
            $form.find(".js-rx-axis").removeClass("rx-disabled");
            if (name === "od_cyl") $form.find("#od_axis").prop("disabled",false);
            if (name === "os_cyl") $form.find("#os_axis").prop("disabled",false);
          }
        });
        $form.find('#od_axis, #os_axis').change(function() {
          const value = $(this).val();
          if (value !== "") {
            if (value < 1) {
              Utils.MessageBox("This axis value is incorrect.");
              $(this).val(1);
            }
            if (value > 180) {
              Utils.MessageBox("This axis value is incorrect.");
              $(this).val(180);
            };
          }
        });
        this.prescription.forEach(item => {
          if (id === 2) {
            if (item.name === "os_add" || item.name === "od_add") item.value = "";
          }
          $form.find(`[name=${item.name}]`).val(item.value).change();
        });

        $form.find('select, input').change(function () {
          let prescriptionArray = [];
          $form.find('select, input').each(function (index, element) {
            if ($(this).attr('name')) {
              if (['pd', 'od_pd', 'os_pd'].indexOf($(this).attr('name')) === -1 || !$(this).prop("disabled")) {
                prescriptionArray.push({
                  name: $(this).attr('name'),
                  value: $(this).val()
                });
              }
            }
          });
          _this.prescription = prescriptionArray;
        });
        this.$lenses.find('#two-pd-numbers').change(function () {
          if ($(this).prop('checked')) {
            _this.$lenses.find(".pd-add-one").hide();
            _this.$lenses.find(".pd-add-one select").attr("disabled", true);
            _this.$lenses.find(".pd-add-two select").attr("disabled", false);
            _this.$lenses.find(".pd-add-two").show();
          } else {
            _this.$lenses.find(".pd-add-two").hide();
            _this.$lenses.find(".pd-add-two select").attr("disabled", true);
            _this.$lenses.find(".pd-add-one select").attr("disabled", false);
            _this.$lenses.find(".pd-add-one").show();
          }
        });
        break;
    
      default:
        break;
    }
    
  }
  /* 前往详情界面 */
  _toLensesSelectDetail(option, select) {
    const _this = this;
    this._addHistory({
     type: "detail",
      option,
      select
    });
    if (!_this.history[1].option || !_this.history[1].option.prescription) {
      _this.prescriptionId = 0;
    }
    if (_this.prescriptionId === 0) {
      _this.prescription = [];
    }
    this._updateSubtotalPrice(option.price)
    let infosHTml = "";
    if (option.lens.infos) {
      option.lens.infos.forEach(info => {
        infosHTml += /*html*/`
          <div class="lenses-select-detail--lr">
            <div class="lenses-select-detail--name">${info.name}</div>
            <div class="lenses-select-detail--value">${info.value}</div>
          </div>
        `;
      });
    }
    const html = /*html*/`
      <div class="lenses-select-detail">
        <div class="lenses-select-detail-row">
          <div class="lenses-select-detail--title">Frame</div>
          <div class="lenses-select-detail--content lenses-select-detail--lr">
            <div class="lenses-select-detail--name">
              ${this.product.title} | ${this.selected_variant.title}
            </div>
            <div class="lenses-select-detail--value">
              <b>${theme.Currency.formatMoney(this.selected_variant.price)}</b>
            </div>
          </div>
        </div>
        <div class="lenses-select-detail-row">
          <div class="lenses-select-detail--title">Your prescription</div>
          <div class="lenses-select-detail--content">
            ${this._getDetailPrescriptionHtml()}
          </div>
        </div>
        <div class="lenses-select-detail-row">
          ${infosHTml}
        </div>
        <div class="lenses-select-detail-row lenses-select-detail--subtotal">
          <div class="lenses-select-detail--lr">
            <div class="lenses-select-detail--name">Subtotal</div>
            <div class="lenses-select-detail--value">
              ${theme.Currency.formatMoney(this.selected_variant.price + option.price)}
            </div>
          </div>
        </div>
        <div class="lenses-select-detail-row text-right">
          <button type="button" class="btn lenses-add-to-cart lenses-select-button" data-lenses-add-to-cart>Add to cart</div>
        </div>
      </div>
    `;
    this._updateLensesSelectStepTitle(this.lensesData.step_count + 1, this.lensesData.detail.title);
    this.$lenses.find("[data-lenses-select-content]").html(html);
    $("[data-lenses-add-to-cart]").click(function (e) { 
      e.preventDefault();
      _this._addToCart(option);
    });
  }
  async _addToCart(option) {
    // 解读数据
    const _this = this;
    const time = new Date().getTime();
    const prescription = {
      id: _this.prescriptionId,
      data: _this.prescription 
    }
    
    const product = {
      id: _this.selected_variant.id,
      quantity: 1,
      properties: {
        '_time': time,
        '_lens_id': option.lens.id,
        '_lens_handle': option.lens.handle,
        '_lens_infos': JSON.stringify(option.lens.infos),
        '_lens_price': option.price,
        '_lens_prescription': JSON.stringify(prescription)
      }
    };
    const lens = {
      id: option.lens.id,
      quantity: 1,
      properties: {
        '_time': time,
        '_product_id': _this.selected_variant.id
      }
    };
    const data = {
      items: [
        product,
        lens
      ]
    }
    const rel = await Ajax.addToCart(data);
    window.location.href = routes.cart;

    $(document.body).trigger('lenses.addToCart', [_this]);
  }
  _getDetailPrescriptionHtml() {
    let html = '';
    switch (this.prescriptionId) {
      case 1:
      case 2:
        const _p = this.prescription;
        const _parr = [];
        html += /*html*/`<li><div class="p_title"></div><div class="p_od">OD</div><div class="p_os">OS</div></li>`;
        _p.forEach(item => {
          _parr[item.name] = item.value;
        });
        _p.forEach(item => {
          const name = item.name;
          if (name.indexOf('_') === -1) {
            html += /*html*/`<li><div class="p_title">${name}</div><div style="line-height: 4rem;height: 4rem;" data-name="${name}">${item.value}</div></li>`;
          } else {
            const _arr = name.split('_');
            const _s = _arr[0];
            const _n = _arr[1];
            if (_s === 'od') {
              const _od = `od_${_n}`;
              const _os = `os_${_n}`;
              const _odv = _parr[_od];
              const _osv = _parr[_os];
              html += /*html*/`<li><div class="p_title">${_n}</div><div data-name="${_od}">${_odv}</div><div data-name="${_os}">${_osv}</div></li>`;
            }
          }
        });
        html = /*html*/`
          <ul class="lenses-select-detail--prescription">${html}</ul>
        `;
        break;
    
      default:
        html = /*html*/`<div>No prescription required.</div>`;
        break;
    }
    return html;
  }
}

$(document).on('click', '[data-click-select-lenses]', function () {
  const product = JSON.parse($("[data-product-json]").html());
  const id = $(this).parents('form').find("[name=id]").val();
  lenses[`${id}`] = new Lenses(id, product);
});

// const product = JSON.parse($("[data-product-json]").html());
// const id = $(".form__wrapper").find("[name=id]").val();
// lenses[1] = new Lenses(id, product);

