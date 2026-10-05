import { describe, expect, it } from "vitest";
import { getListingContactLinks } from "../../src/lib/listing-contact";

describe("listing contact links", () => {
  it("creates actionable telephone and email links when contact exists", () => {
    expect(
      getListingContactLinks({
        phone: "+49 151 23456789",
        email: "owner@example.com",
      }),
    ).toEqual({
      phoneHref: "tel:+4915123456789",
      emailHref: "mailto:owner@example.com",
    });
  });

  it("returns no action for legacy listings without contact details", () => {
    expect(getListingContactLinks(null)).toEqual({
      phoneHref: null,
      emailHref: null,
    });
  });
});
