import { z } from 'zod';
const cleanText = (value: string) =>
  value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '').trim();
// Reuse this schema in a future server endpoint; browser validation is only UX.
export const contactSchema = z.object({
  name: z.string().trim().min(1).max(100).transform(cleanText),
  company: z.string().max(150).transform(cleanText),
  email: z.string().trim().email().max(254),
  phone: z.string().max(30).transform(cleanText),
  service: z.string().max(100).transform(cleanText),
  message: z.string().trim().min(10).max(5000).transform(cleanText),
});
export type Contact = z.infer<typeof contactSchema>;
export function buildContactEmail(contact: Contact) {
  const subject = `Projeto Lime: ${contact.name.replace(/[\r\n]/g, ' ')}`;
  const body = `Nome: ${contact.name}\nEmpresa: ${contact.company}\nE-mail: ${contact.email}\nWhatsApp: ${contact.phone}\nServiço: ${contact.service}\n\n${contact.message}`;
  return `mailto:carol@limeagencia.com.br?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
