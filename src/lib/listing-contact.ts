export function getListingContactLinks(contact?: {
  phone?: string;
  email?: string;
} | null) {
  return {
    phoneHref: contact?.phone
      ? `tel:${contact.phone.replace(/\s/g, "")}`
      : null,
    emailHref: contact?.email ? `mailto:${contact.email}` : null,
  };
}
