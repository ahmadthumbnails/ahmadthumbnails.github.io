// Builds the page from data/config.js (SITE) and data/thumbnails.js (THUMBNAILS).
// You shouldn't need to edit this file to add thumbnails or change text.

(function () {
  "use strict";

  function $(id) { return document.getElementById(id); }
  function tagsOf(item) { return Array.isArray(item.tags) ? item.tags : []; }

  var igProfile = "https://instagram.com/" + SITE.instagram;
  var igDm = "https://ig.me/m/" + SITE.instagram; // opens a DM with you

  /* ---------- Site text, links, footer ---------- */
  document.title = SITE.fullTitle;
  $("brandName").textContent = SITE.name;
  $("headline").textContent = SITE.headline;
  $("intro").textContent = SITE.intro;
  $("contactIntro").textContent = SITE.contactIntro;
  $("igLink").href = igProfile;
  $("igLink").textContent = "Instagram @" + SITE.instagram;
  $("igFoot").href = igProfile;
  $("igFoot").textContent = "Instagram";
  $("copyright").textContent = "\u00A9 " + new Date().getFullYear() + " " + SITE.name;

  /* ---------- FAQ ---------- */
  SITE.faq.forEach(function (item) {
    var d = document.createElement("details");
    var s = document.createElement("summary");
    var p = document.createElement("p");
    s.textContent = item.q;
    p.textContent = item.a;
    d.appendChild(s);
    d.appendChild(p);
    $("faqList").appendChild(d);
  });

  /* ---------- Thumbnails ---------- */
  var grid = $("grid");
  var filters = $("filters");
  var lightbox = $("lightbox");
  var current = "All";

  function placeholder(text) {
    var d = document.createElement("div");
    d.className = "ph";
    d.textContent = text;
    return d;
  }

  // Puts the image in `el`. If the file path is wrong, shows which path failed.
  function fillThumb(el, item, lazy) {
    el.textContent = "";
    if (!item.image) {
      el.appendChild(placeholder("No image set for \u201C" + item.title + "\u201D"));
      return;
    }
    var img = new Image();
    img.alt = item.title + " thumbnail";
    if (lazy) img.loading = "lazy";
    img.onerror = function () {
      el.textContent = "";
      el.appendChild(placeholder("Image not found: " + item.image));
    };
    img.src = item.image;
    el.appendChild(img);
  }

  function renderGrid() {
    grid.textContent = "";
    var shown = 0;
    THUMBNAILS.forEach(function (item) {
      if (current !== "All" && tagsOf(item).indexOf(current) === -1) return;
      shown++;

      var card = document.createElement("button");
      card.type = "button";
      card.className = "card";
      card.setAttribute("aria-label", "View " + item.title);

      var thumb = document.createElement("div");
      thumb.className = "thumb";
      fillThumb(thumb, item, true);

      var cap = document.createElement("div");
      cap.className = "cap";
      var t = document.createElement("strong");
      t.textContent = item.title;
      var tg = document.createElement("span");
      tg.textContent = tagsOf(item).join(", ");
      cap.appendChild(t);
      cap.appendChild(tg);

      card.appendChild(thumb);
      card.appendChild(cap);
      card.addEventListener("click", function () { openLightbox(item); });
      grid.appendChild(card);
    });

    if (!shown) {
      var msg = document.createElement("p");
      msg.className = "empty";
      msg.textContent = THUMBNAILS.length
        ? "Nothing with this tag yet."
        : "No thumbnails yet. Add some in data/thumbnails.js.";
      grid.appendChild(msg);
    }
  }

  function renderFilters() {
    var tags = ["All"];
    THUMBNAILS.forEach(function (item) {
      tagsOf(item).forEach(function (tag) { if (tags.indexOf(tag) === -1) tags.push(tag); });
    });
    filters.textContent = "";
    if (tags.length < 3) return; // no point showing filters for a single tag
    tags.forEach(function (tag) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "chip";
      b.textContent = tag;
      b.setAttribute("aria-pressed", tag === current ? "true" : "false");
      b.addEventListener("click", function () {
        current = tag;
        Array.prototype.forEach.call(filters.children, function (chip) {
          chip.setAttribute("aria-pressed", chip.textContent === tag ? "true" : "false");
        });
        renderGrid();
      });
      filters.appendChild(b);
    });
  }

  /* ---------- Lightbox ---------- */
  function openLightbox(item) {
    fillThumb($("lbMedia"), item, false);
    $("lbTitle").textContent = item.title;
    $("lbTags").textContent = tagsOf(item).join(", ");
    var link = $("lbLink");
    if (item.link) { link.href = item.link; link.hidden = false; } else { link.hidden = true; }
    if (typeof lightbox.showModal === "function") lightbox.showModal();
  }
  $("lbClose").addEventListener("click", function () { lightbox.close(); });
  lightbox.addEventListener("click", function (e) { if (e.target === lightbox) lightbox.close(); });

  renderFilters();
  renderGrid();

  /* ---------- Contact form: writes a message to send as an Instagram DM ---------- */
  var form = $("form");
  var result = $("result");
  var msg = $("msg");
  var statusEl = $("status");

  $("openBtn").href = igDm;

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var name = form.elements.name.value.trim();
    var channel = form.elements.channel.value.trim();
    var need = form.elements.need.value.trim();

    var text = "Hi " + SITE.name + ", I'm " + name + ".";
    if (channel) text += " My channel is " + channel + ".";
    text += " I'd like thumbnails for: " + need + ". Could you send me a quote?";

    msg.value = text;
    statusEl.textContent = "Copy the message, then paste it into a DM.";
    result.classList.add("show");
    result.scrollIntoView({ behavior: "smooth", block: "nearest" });
  });

  $("copyBtn").addEventListener("click", function () {
    function fallback() {
      try {
        msg.focus();
        msg.select();
        var ok = document.execCommand("copy");
        statusEl.textContent = ok ? "Copied. Paste it into a DM." : "Select the message above and copy it.";
      } catch (err) {
        statusEl.textContent = "Select the message above and copy it.";
      }
    }
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(msg.value).then(function () {
          statusEl.textContent = "Copied. Paste it into a DM.";
        }, fallback);
      } else {
        fallback();
      }
    } catch (err) {
      fallback();
    }
  });
})();
