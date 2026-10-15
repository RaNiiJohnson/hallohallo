import {
  Html,
  Head,
  Body,
  Container,
  Heading,
  Text,
  Link,
  Hr,
  Section,
} from "react-email";

interface NewApplicationEmailProps {
  candidateName: string;
  candidateEmail: string;
  jobTitle: string;
  coverLetter?: string;
  cvUrl?: string;
}

export default function NewApplicationEmail({
  candidateName,
  candidateEmail,
  jobTitle,
  coverLetter,
  cvUrl,
}: NewApplicationEmailProps) {
  return (
    <Html lang="de">
      <Head />
      <Body style={{ fontFamily: "sans-serif" }}>
        <Container>
          <Heading>Neue Bewerbung</Heading>
          <Text>
            Sie haben eine Bewerbung von <strong>{candidateName}</strong> für
            die Stelle <strong>{jobTitle}</strong> erhalten.
          </Text>
          <Text>
            <strong>E-Mail-Adresse der bewerbenden Person:</strong>{" "}
            {candidateEmail}
          </Text>
          <Hr />
          <Section>
            <Heading as="h3">Anschreiben</Heading>
            <Text style={{ whiteSpace: "pre-wrap" }}>
              {coverLetter || "Nicht angegeben"}
            </Text>
          </Section>
          <Hr />
          <Section>
            <Heading as="h3">CV</Heading>
            {cvUrl ? (
              <Link href={cvUrl} target="_blank">
                Lebenslauf herunterladen
              </Link>
            ) : (
              <Text>Nicht angegeben</Text>
            )}
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
