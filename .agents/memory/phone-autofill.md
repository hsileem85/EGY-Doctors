---
name: Phone autofill normalization
description: Browser autofill ordering requirements for country-code phone inputs.
---

Do not apply native `maxLength` to the local phone field. Normalize the complete incoming browser value first: remove formatting, strip the selected country code in `+`, `00`, or unprefixed form when it is a complete international number, remove the trunk zero, and only then clamp to the country's local maximum.

**Why:** Password managers can inject the complete international phone number. Native length enforcement or clamping before country-code detection keeps the prefix and discards valid digits from the end.

**How to apply:** Keep the shared phone input controlled and enforce local length inside its change normalizer. Derive both the dial-code digits and local maximum from the currently selected country.