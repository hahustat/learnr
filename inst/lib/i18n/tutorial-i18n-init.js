$(document).on("shiny:sessioninitialized", function() {
  // This can be uncommented to allow to switch from one lang to the other
  // For testing
  /*
  var arr = [
    { val: "en", text: 'English' },
    { val: "fr", text: 'French' }
  ];
  var sel = $('<select>')

  arr.map(x => ($(sel).append(`<option value="${x.val}">${x.text}</option>`)));
  sel.name = "lang"
  sel.on('change', function() {
    i18next.changeLanguage(this.value)
    $('html').localize();
  });

  $("#tutorial-topic").append(
    '<label for="lang">Switch lang</label>'
  );
  $("#tutorial-topic").append(sel);
  */

  // customizations are stored as JSON in #i18n-cstm-trns <script>
  var i18nCustom = document.getElementById('i18n-cstm-trns');
  if (!i18nCustom) {
    i18nCustom = {language: 'en'};
  } else {
    i18nCustom = JSON.parse(i18nCustom.innerText);
  }

  if (i18nCustom.resources) {
    // copy customizations into base translation namespace
    Object.keys(i18nCustom.resources).forEach(function(lng) {
      var resource = i18nCustom.resources[lng]
      if (resource.custom) {
        if (resource.translation) {
          Object.keys(resource.custom).forEach(function(keyGroup) {
            Object.assign(resource.translation[keyGroup], resource.custom[keyGroup])
          })
        } else {
          resource.translation = resource.custom
        }
      }
    })
  }

  i18next.init({
    lng: i18nCustom.language || 'en',
    fallbackLng: 'en',
    ns: 'translation',
    resources: i18nCustom.resources || {}
  }, function(err, t) {
    if (err) return console.log('[i18next] Error loading translations:', err);
    jqueryI18next.init(i18next, $);
    $('html').localize();
  });

  /* Method for localization of the tutorial
   *
   * @param lang New language for tutorial, if undefined returns the object with
   *   language customizations used to initialize i18next
   * @param selector CSS selector of elements to localize
   * @param opts Options passed to .localize() method from jqueryI18next
   *
   */
  window.tutorial.$localize = function(lang, selector = 'html', opts = {}) {
    if (typeof lang === 'undefined') {
      return i18nCustom;
    }
    i18next.changeLanguage(lang);
    $(selector).localize(opts);
  }

  // localize question buttons when shown
  $(document).on('shiny:value', '.tutorial-question', function(ev) {
    setTimeout(function() { $(ev.target).localize() }, 0);
  });

  function localizeHandler(x) {
    var selector,language;
    if (
      typeof x === 'string' ||
      (Array.isArray(x) && x.every(function(s) { return typeof s === 'string' }))
    ) {
      selector = x;
    } else if (typeof x === 'object') {
      selector = x.selector || 'html';
      language = x.language;
    } else {
      return console.log('localize message must be a string with selector(s) or an object with optional keys selector and language.');
    }
    if (language) {
      i18next.changeLanguage(language);
    }
    $(selector).localize();
  }

  Shiny.addCustomMessageHandler('localize', localizeHandler);
});