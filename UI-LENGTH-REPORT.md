# Cross-locale UI text length report

Branch `hermes/seo-round2`. I compared every short UI string (nav items, buttons,
chat labels, footer links, form labels, error-page buttons) in nl/ro/ru against
English, looking for translations that are much longer AND sit in a tight element.
Body paragraphs were out of scope and untouched.

## What I shortened (committed)

All three are button labels where the translation ran far longer than English and
a shorter, idiomatic form carries the identical meaning:

| key | element | before | after | en |
|---|---|---|---|---|
| `ru` `contact.form.send` | form submit button | "отправить сообщение" (19) | **"отправить"** (9) | "send message" (12) |
| `ru` `error.generic.retry` | error-page button | "попробовать снова" (17) | **"повторить"** (9) | "try again" (9) |
| `ro` `error.generic.retry` | error-page button | "încearcă din nou" (16) | **"reîncearcă"** (10) | "try again" (9) |

"Отправить" / "Повторить" / "Reîncearcă" are the standard short button forms in
those languages, so meaning is unchanged (the RU submit button now matches the
RU chat "send" button, "отправить").

## Not changed — flagged as false alarms (no visual risk)

These looked long in a raw length diff but render into **aria-labels**, never
visible text, so they cannot overflow anything:

- `nav.openMenu`, `nav.closeMenu` (e.g. ro "Deschide meniul" / "Închide meniul")
- `nav.language` (translated, but used as a control label/aria)
- `footer.legal.label` (ru "Правовая информация", 19) is the footer `<nav aria-label>`,
  not a visible heading.

## Not changed — please eyeball in the browser (real, but no safe shortening)

These are genuinely longer than English and DO render visibly. I did not touch
them because there is no shorter form that keeps the meaning, or the element
wraps/has room. Worth a quick visual check at mobile and small-desktop widths:

1. **Desktop nav bar (RU) — highest priority.** The horizontal nav labels are the
   longest set and compete for one row:
   - `nav.work` ru "посмотрите вживую" (17), ro "vezi cu ochii tăi" (17)
   - `nav.process` ru "как мы работаем" (15)
   - `nav.services` ru "что мы делаем" (13)
   Five items at these widths may crowd or wrap on narrower desktops. These are
   already concise translations of the (deliberately loose) English labels, so
   shortening further would change meaning. If the row is tight, the fix is
   layout-side (smaller gap, earlier collapse to the mobile menu) rather than copy.

2. **Footer legal links (RO/RU).** `footer.legal.privacy` ro "confidențialitate"
   (17), ru "конфиденциальность" (18) vs en "privacy" (7). These are the correct,
   shortest accurate words; the footer link row uses `flex-wrap`, so they should
   wrap rather than overflow. Confirm the wrap looks intentional.

3. **Chat launcher / hint (RO/RU).** `chat.launcher` ro "întreabă kaolin" /
   ru "спросить kaolin" (15) vs "ask kaolin" (10); `chat.hint` nl "probeer mij" /
   ro "încearcă-mă" (11) vs "try me" (6). The launcher and hint are pills that size
   to their content, so risk is low, but if either has a fixed width, check RO/RU.

4. **Contact submit (NL/RO).** `contact.form.send` nl "verstuur bericht" (16),
   ro "trimite mesajul" (15) vs "send message" (12). Only 3-4 chars over English
   and the button has horizontal padding with room in the `max-w-[55ch]` form, so
   I left them literal. Shorten to "verstuur" / "trimite" if the button ever looks
   tight on mobile.

## Method

Flagged any nl/ro/ru string that was both >40% longer than English and longer by
more than 3 characters, then judged each by the element it actually renders in.
No em/en dashes introduced; RO diacritics remain comma-below `ș`/`ț`; RU stays
genuine Cyrillic. `next build` passes.
