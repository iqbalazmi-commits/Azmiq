/* AZMIQ theme behaviour. Everything here is progressive enhancement: the
   menu, gallery, variant picker and cart all work as plain HTML first. */
(function () {
  "use strict";

  /* ---------------------------------------------------- sticky header */
  var header = document.querySelector("[data-header]");
  if (header) {
    var onScroll = function () { header.classList.toggle("is-scrolled", window.scrollY > 8); };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* -------------------------------------------------------- mobile nav */
  document.querySelectorAll("[data-mobile-nav]").forEach(function (details) {
    var close = function () { details.removeAttribute("open"); };
    details.addEventListener("toggle", function () {
      document.documentElement.classList.toggle("nav-open", details.open);
    });
    details.querySelectorAll("[data-close]").forEach(function (el) { el.addEventListener("click", close); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && details.open) close(); });
  });

  /* ------------------------------------------------------- hero slides */
  document.querySelectorAll("[data-hero]").forEach(function (hero) {
    var slides = hero.querySelectorAll(".hero__slide");
    if (slides.length < 2 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    var i = 0;
    var interval = parseInt(hero.getAttribute("data-interval") || "6", 10) * 1000;
    setInterval(function () {
      slides[i].classList.remove("is-active");
      i = (i + 1) % slides.length;
      slides[i].classList.add("is-active");
    }, interval);
  });

  /* ----------------------------------------------------------- gallery */
  function showImage(gallery, index) {
    var images = gallery.querySelectorAll(".gallery__main img");
    var thumbs = gallery.querySelectorAll(".gallery__thumb");
    images.forEach(function (img, n) { img.classList.toggle("is-active", n === index); });
    thumbs.forEach(function (t, n) { t.setAttribute("aria-current", n === index ? "true" : "false"); });
  }
  document.querySelectorAll("[data-gallery]").forEach(function (gallery) {
    gallery.querySelectorAll(".gallery__thumb").forEach(function (thumb, n) {
      thumb.addEventListener("click", function () { showImage(gallery, n); });
    });
  });

  /* ---------------------------------------------------- quantity input */
  document.querySelectorAll("[data-qty]").forEach(function (wrap) {
    var input = wrap.querySelector("input");
    wrap.querySelectorAll("button").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var step = btn.getAttribute("data-step") === "up" ? 1 : -1;
        var min = parseInt(input.min || "0", 10);
        var next = Math.max(min, (parseInt(input.value, 10) || 0) + step);
        input.value = next;
        input.dispatchEvent(new Event("change", { bubbles: true }));
      });
    });
  });

  /* ---------------------------------------------------- variant picker */
  function money(cents, format) {
    var value = (cents / 100).toFixed(2);
    var noDecimals = (cents / 100).toFixed(0);
    return (format || "£{{amount}}")
      .replace(/\{\{\s*amount_no_decimals\s*\}\}/, noDecimals.replace(/\B(?=(\d{3})+(?!\d))/g, ","))
      .replace(/\{\{\s*amount_with_comma_separator\s*\}\}/, value.replace(".", ","))
      .replace(/\{\{\s*amount\s*\}\}/, value.replace(/\B(?=(\d{3})+(?!\d))/g, ","));
  }

  document.querySelectorAll("[data-product]").forEach(function (root) {
    var json = root.querySelector("[data-product-json]");
    if (!json) return;
    var product = JSON.parse(json.textContent);
    var form = root.querySelector("form[data-product-form]");
    var idInput = form && form.querySelector("input[name=id]");
    var moneyFormat = root.getAttribute("data-money-format");
    var gallery = root.querySelector("[data-gallery]");

    function selectedOptions() {
      return Array.prototype.map.call(root.querySelectorAll("fieldset.option"), function (fs) {
        var checked = fs.querySelector("input:checked");
        return checked ? checked.value : null;
      });
    }

    function update() {
      var opts = selectedOptions();
      var variant = product.variants.find(function (v) {
        return v.options.every(function (o, n) { return o === opts[n]; });
      });

      // Grey out values that have no available variant with the other choices.
      root.querySelectorAll("fieldset.option").forEach(function (fs, pos) {
        fs.querySelectorAll("input").forEach(function (input) {
          var trial = opts.slice(); trial[pos] = input.value;
          var exists = product.variants.some(function (v) {
            return v.available && v.options.every(function (o, n) { return o === trial[n]; });
          });
          var label = fs.querySelector('label[for="' + input.id + '"]');
          if (label) label.classList.toggle("is-unavailable", !exists);
        });
        var shown = fs.querySelector("[data-selected]");
        if (shown) shown.textContent = opts[pos] || "";
      });

      var button = form && form.querySelector("[data-add]");
      var stock = root.querySelector("[data-stock]");
      if (!variant) {
        if (button) { button.disabled = true; button.textContent = button.getAttribute("data-unavailable"); }
        return;
      }
      if (idInput) idInput.value = variant.id;
      if (button) {
        button.disabled = !variant.available;
        button.textContent = variant.available ? button.getAttribute("data-add-label") : button.getAttribute("data-soldout");
      }
      if (stock) {
        stock.textContent = variant.available ? stock.getAttribute("data-in") : stock.getAttribute("data-out");
        stock.className = "buy__stock " + (variant.available ? "buy__stock--in" : "buy__stock--out");
      }

      var now = root.querySelector("[data-price-now]");
      var was = root.querySelector("[data-price-was]");
      var save = root.querySelector("[data-price-save]");
      if (now) now.textContent = money(variant.price, moneyFormat);
      var onSale = variant.compare_at_price && variant.compare_at_price > variant.price;
      if (was) { was.hidden = !onSale; if (onSale) was.querySelector("[data-amount]").textContent = money(variant.compare_at_price, moneyFormat); }
      if (save) {
        save.hidden = !onSale;
        if (onSale) save.textContent = save.getAttribute("data-template").replace("[percent]", Math.floor((1 - variant.price / variant.compare_at_price) * 100));
      }

      if (gallery && variant.featured_media) {
        var idx = Array.prototype.findIndex.call(gallery.querySelectorAll(".gallery__main img"), function (img) {
          return img.getAttribute("data-media-id") === String(variant.featured_media.id);
        });
        if (idx >= 0) showImage(gallery, idx);
      }

      if (window.history.replaceState) {
        var url = new URL(window.location.href);
        url.searchParams.set("variant", variant.id);
        window.history.replaceState({}, "", url.toString());
      }
    }

    root.querySelectorAll("fieldset.option input").forEach(function (input) { input.addEventListener("change", update); });
    update();

    /* Add to cart without leaving the page; falls back to /cart if JS fails. */
    if (form) {
      form.addEventListener("submit", function (e) {
        if (!window.fetch) return;
        e.preventDefault();
        var button = form.querySelector("[data-add]");
        var message = root.querySelector("[data-message]");
        button.disabled = true;
        fetch(window.Shopify && Shopify.routes ? Shopify.routes.root + "cart/add.js" : "/cart/add.js", {
          method: "POST",
          headers: { Accept: "application/json" },
          body: new FormData(form),
        })
          .then(function (r) { return r.json().then(function (body) { return { ok: r.ok, body: body }; }); })
          .then(function (res) {
            button.disabled = false;
            if (!res.ok) {
              if (message) { message.className = "buy__message form-message form-message--error"; message.textContent = res.body.description || res.body.message; }
              return;
            }
            if (message) {
              message.className = "buy__message form-message form-message--success";
              message.innerHTML = message.getAttribute("data-added").replace("[title]", res.body.product_title) +
                ' <a href="' + (window.routes && window.routes.cart || "/cart") + '" style="text-decoration:underline">' + message.getAttribute("data-view") + "</a>";
            }
            return fetch((window.routes && window.routes.cart || "/cart") + ".js").then(function (r) { return r.json(); }).then(function (cart) {
              document.querySelectorAll("[data-cart-count]").forEach(function (el) {
                el.textContent = cart.item_count;
                el.hidden = cart.item_count === 0;
              });
            });
          })
          .catch(function () { form.submit(); });
      });
    }
  });

  /* ------------------------------------------ cart: update on change */
  document.querySelectorAll("[data-cart-form] input[data-line-qty]").forEach(function (input) {
    input.addEventListener("change", function () { input.form.requestSubmit ? input.form.requestSubmit() : input.form.submit(); });
  });

  /* ------------------------------------- collection filters auto-apply */
  document.querySelectorAll("[data-filters]").forEach(function (form) {
    form.querySelectorAll('input[type="checkbox"]').forEach(function (cb) {
      cb.addEventListener("change", function () { form.submit(); });
    });
    var applyButton = form.querySelector("[data-apply]");
    if (applyButton && !form.querySelector('input[type="number"]')) applyButton.hidden = true;
  });

  /* ---------------------------------------- currency switcher submit */
  document.querySelectorAll("[data-localization] select").forEach(function (select) {
    select.addEventListener("change", function () { select.form.submit(); });
  });
})();
