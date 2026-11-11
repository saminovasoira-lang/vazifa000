/**
 * ULASH MARKET — Emoji Mono Utility
 * Barcha emojilarni qora/monoxrom ko'rinishda ko'rsatish
 * 
 * Usul: Unicode text variation selector (\uFE0E) qo'shish va
 *       CSS filter orqali ranglarni olib tashlash.
 */

(function() {
    'use strict';

    // Emoji Unicode diapazonlarini aniqlash uchun regex
    const EMOJI_REGEX = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{27BF}\u{2300}-\u{23FF}\u{2B00}-\u{2BFF}\u{FE00}-\u{FE0F}\u{1F000}-\u{1F02F}\u{1F0A0}-\u{1F0FF}\u{1F100}-\u{1F1FF}\u{1F200}-\u{1F2FF}\u{1F004}\u{1F0CF}\u{1F3FB}-\u{1F3FF}\u{1F9B0}-\u{1F9B3}\u{20D0}-\u{20FF}☀☁☂☃☄★☆☎☏☑☒☓☔☕☖☗☘☙☚☛☜☝☞☟☠☡☢☣☤☥☦☧☨☩☪☫☬☭☮☯☰☱☲☳☴☵☶☷☸☹☺☻☼☽☾☿♀♁♂♃♄♅♆♇♈♉♊♋♌♍♎♏♐♑♒♓♔♕♖♗♘♙♚♛♜♝♞♟♠♡♢♣♤♥♦♧♨♩♪♫♬♭♮♯⚀⚁⚂⚃⚄⚅⚆⚇⚈⚉⚊⚋⚌⚍⚎⚏⚐⚑⚒⚓⚔⚕⚖⚗⚘⚙⚚⚛⚜⚝⚞⚟⚠⚡⚢⚣⚤⚥⚦⚧⚨⚩⚪⚫⚬⚭⚮⚯⚰⚱⚲⚳⚴⚵⚶⚷⚸⚹⚺⚻⚼⛀⛁⛂⛃⛄⛅⛆⛇⛈⛉⛊⛋⛌⛍⛎⛏⛐⛑⛒⛓⛔⛕⛖⛗⛘⛙⛚⛛⛜⛝⛞⛟⛠⛡⛢⛣⛤⛥⛦⛧⛨⛩⛪⛫⛬⛭⛮⛯⛰⛱⛲⛳⛴⛵⛶⛷⛸⛹⛺⛻⛼⛽⛾⛿✀✁✂✃✄✅✆✇✈✉✊✋✌✍✎✏✐✑✒✓✔✕✖✗✘✙✚✛✜✝✞✟✠✡✢✣✤✥✦✧✨✩✪✫✬✭✮✯✰✱✲✳✴✵✶✷✸✹✺✻✼✽✾✿❀❁❂❃❄❅❆❇❈❉❊❋❌❍❎❏❐❑❒❓❔❕❖❗❘❙❚❛❜❝❞❟❠❡❢❣❤❥❦❧❨❩❪❫❬❭❮❯❰❱❲❳❴❵➔➕➖➗➘➙➚➛➜➝➞➟➠➡➢➣➤➥➦➧➨➩➪➫➬➭➮➯➰➱➲➳➴➵➶➷➸➹➺➻➼➽➾🀀-🿿]/gu;

    // Text variation selector — emoji ni qora matn sifatida ko'rsatadi
    const TEXT_SELECTOR = '\uFE0E';

    /**
     * Berilgan matn ichidagi emojilardan keyin \uFE0E qo'shadi
     * Bu emoji ni qora matn (text presentation) sifatida ko'rsatadi
     */
    function addTextSelector(text) {
        if (!text) return text;
        // Avval mavjud selectorlarni olib tashlaymiz, keyin qayta qo'shamiz
        return text.replace(/\uFE0F|\uFE0E/g, '').replace(EMOJI_REGEX, (match) => {
            return match + TEXT_SELECTOR;
        });
    }

    /**
     * DOM elementining matn tugunlarini qayta ishlash
     */
    function processTextNode(node) {
        if (!node || !node.nodeValue) return;
        const original = node.nodeValue;
        const processed = addTextSelector(original);
        if (processed !== original) {
            node.nodeValue = processed;
        }
    }

    /**
     * Element va uning barcha bolalari (children) ichidagi
     * matnlarni qayta ishlash
     */
    function processElement(element) {
        if (!element) return;

        // O'tkazib yuborish kerak bo'lgan teglar
        const skip = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'TEMPLATE', 'IMG', 'VIDEO', 'CANVAS', 'SVG', 'INPUT', 'TEXTAREA']);

        const walker = document.createTreeWalker(
            element,
            NodeFilter.SHOW_TEXT,
            {
                acceptNode: function(node) {
                    // Parent element o'tkazib yuborilishi kerakmi?
                    let parent = node.parentElement;
                    while (parent) {
                        if (skip.has(parent.tagName)) {
                            return NodeFilter.FILTER_REJECT;
                        }
                        parent = parent.parentElement;
                    }
                    return NodeFilter.FILTER_ACCEPT;
                }
            }
        );

        const textNodes = [];
        let node;
        while ((node = walker.nextNode())) {
            textNodes.push(node);
        }
        textNodes.forEach(processTextNode);
    }

    /**
     * CSS orqali barcha emoji-larni qora rangga majburlash
     * Bu font-variant-emoji ni qo'llab-quvvatlamaydigan brauzerlar uchun
     */
    function injectEmojiCSS() {
        const style = document.createElement('style');
        style.id = 'emoji-mono-style';
        style.setAttribute('data-emoji-mono', 'true');
        style.textContent = `
            /* Emoji monochrome override */
            * {
                font-variant-emoji: text !important;
            }
            
            /* Emoji unicode text presentation */
            body {
                font-variant-emoji: text;
            }

            /* Qo'shimcha CSS trick: emoji har doim qora bo'ladi */
            /* Bu webkit va blink uchun ishlaydi */
            @media screen {
                body, body * {
                    text-rendering: geometricPrecision;
                }
            }
        `;
        document.head.appendChild(style);
    }

    /**
     * MutationObserver — dinamik qo'shilgan kontentni kuzatish
     * Admin panel, catalog, courier panel uchun zarur
     */
    function observeDOMChanges() {
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                // Yangi qo'shilgan nodelarni qayta ishlash
                mutation.addedNodes.forEach(function(node) {
                    if (node.nodeType === Node.TEXT_NODE) {
                        processTextNode(node);
                    } else if (node.nodeType === Node.ELEMENT_NODE) {
                        // Kichik kechikish bilan — render tugagandan keyin
                        requestAnimationFrame(() => processElement(node));
                    }
                });

                // Matn o'zgarishlarini qayta ishlash
                if (mutation.type === 'characterData' && mutation.target.nodeType === Node.TEXT_NODE) {
                    processTextNode(mutation.target);
                }
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true,
            characterData: true
        });

        return observer;
    }

    /**
     * Asosiy ishga tushirish funksiyasi
     */
    function init() {
        // 1. CSS inject qilish
        injectEmojiCSS();

        // 2. Mavjud kontentni qayta ishlash
        processElement(document.body);

        // 3. Dinamik o'zgarishlarni kuzatish
        observeDOMChanges();

        console.log('[EmojiMono] Barcha emojilar qora/monoxrom qilindi ✓');
    }

    // DOM tayyor bo'lganda ishga tushirish
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        // DOM allaqachon tayyor
        init();
    }

    // Global API — boshqa modullar uchun
    window.EmojiMono = {
        init: init,
        processElement: processElement,
        addTextSelector: addTextSelector
    };

})();
