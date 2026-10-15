import { render } from "react-email";
import { describe, expect, it } from "vitest";
import NewApplicationEmail from "./CvTemplate";

describe("job application email", () => {
  it("renders the recruiter notification in German", async () => {
    const html = await render(
      NewApplicationEmail({
        candidateName: "Ada Lovelace",
        candidateEmail: "ada@example.com",
        jobTitle: "Softwareentwicklerin",
        coverLetter: "Guten Tag",
        cvUrl: "https://files.example.com/cv.pdf",
      }),
    );

    expect(html).toContain('lang="de"');
    expect(html).toContain("Neue Bewerbung");
    expect(html).toContain("Lebenslauf herunterladen");
    expect(html).not.toContain("Nouvelle candidature");
  });
});
