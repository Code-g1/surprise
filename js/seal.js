/* The "seal": everything personal is AES-256-GCM encrypted.
   Key = PBKDF2-SHA512( 4-digit code + private secret from the link , public salt , 3,000,000 rounds ).
   Nothing about her, the letter, the photos or the videos exists in readable form on the website. */
(function () {
  'use strict';
  var ITER = 3000000;
  var enc = new TextEncoder(), dec = new TextDecoder();
  var key = null;

  function subtle() { return window.crypto && window.crypto.subtle; }

  function secretFromLink() {
    var h = (location.hash || '').replace(/^#/, '').replace(/^k=/, '').trim();
    if (h) { try { localStorage.setItem('sl_k', h); } catch (e) { } return h; }
    try { return localStorage.getItem('sl_k') || ''; } catch (e) { return ''; }
  }

  async function deriveKey(pin, secret, salt, usages) {
    var base = await subtle().importKey('raw', enc.encode('v1|' + pin + '|' + secret), 'PBKDF2', false, ['deriveKey']);
    return subtle().deriveKey({ name: 'PBKDF2', salt: salt, iterations: ITER, hash: 'SHA-512' }, base, { name: 'AES-GCM', length: 256 }, false, usages);
  }

  async function fetchBin(id) {
    var r = await fetch('data/' + id + '.bin', { cache: 'force-cache' });
    if (!r.ok) throw new Error('missing:' + id);
    return new Uint8Array(await r.arrayBuffer());
  }

  async function decryptBin(id, bytes) {
    var iv = bytes.slice(0, 12), ct = bytes.slice(12);
    return subtle().decrypt({ name: 'AES-GCM', iv: iv, additionalData: enc.encode(id) }, key, ct);
  }

  window.Seal = {
    ITER: ITER,
    available: function () { return !!subtle(); },
    hasSecret: function () { return !!secretFromLink(); },
    /* Try the code. Resolves with the private content, or throws 'nosecret' / 'bad'. */
    unlock: async function (pin) {
      var secret = secretFromLink();
      if (!secret) throw new Error('nosecret');
      var salt = await fetchBin('s');
      var k = await deriveKey(pin, secret, salt, ['decrypt']);
      key = k;
      try {
        var pt = await decryptBin('p', await fetchBin('p'));
        return JSON.parse(dec.decode(pt));
      } catch (e) { key = null; throw new Error('bad'); }
    },
    /* Decrypt a photo / video / song into a playable address. */
    blobUrl: async function (id, mime) {
      var pt = await decryptBin(id, await fetchBin(id));
      return URL.createObjectURL(new Blob([pt], { type: mime }));
    },
    /* used by the private builder page only */
    _deriveKey: deriveKey,
    _enc: enc
  };
})();
