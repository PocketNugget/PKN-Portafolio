import { t } from "../i18n";
import { cleanBlock, cleanLine, NOTE_NAME_MAX } from "../plain";

const MESSAGE_MAX = 1500;
const MESSAGE_LINES = 20;

export function validMail(value: string): boolean {
  const mail = cleanLine(value, 120);
  return mail !== null && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(mail);
}

export function mountContactForm(form: HTMLFormElement): void {
  const field = (name: string): HTMLInputElement | HTMLTextAreaElement | null =>
    form.querySelector<HTMLInputElement | HTMLTextAreaElement>(`[name="${name}"]`);
  const status = form.querySelector<HTMLElement>(".contact-status");
  const send = form.querySelector<HTMLButtonElement>("button[type='submit']");
  const say = (text: string): void => {
    if (status) status.textContent = text;
  };
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    void (async () => {
      const name = field("name");
      const email = field("email");
      const body = field("message");
      const trap = field("company");
      if (!name || !email || !body || !trap) return;
      say("");
      if (!cleanLine(name.value, NOTE_NAME_MAX) || !validMail(email.value) || !cleanBlock(body.value, MESSAGE_MAX, MESSAGE_LINES)) {
        say(t("Check the name, the email, and the message."));
        return;
      }
      if (send) send.disabled = true;
      try {
        const response = await fetch("/api/contact", {
          method: "POST",
          credentials: "same-origin",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ name: name.value, email: email.value, body: body.value, company: trap.value }),
        });
        if (response.status === 201) {
          name.value = "";
          email.value = "";
          body.value = "";
          trap.value = "";
          say(t("Sent. Thank you."));
        } else {
          say(response.status === 429 ? t("too many messages. try later.") : t("The message did not send."));
        }
      } catch {
        say(t("The message did not send."));
      } finally {
        if (send) send.disabled = false;
      }
    })();
  });
}
