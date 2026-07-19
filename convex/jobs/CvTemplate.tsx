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
    <Html>
      <Head />
      <Body style={{ fontFamily: "sans-serif" }}>
        <Container>
          <Heading>Nouvelle candidature</Heading>
          <Text>
            Vous avez reçu une candidature de <strong>{candidateName}</strong>{" "}
            pour le poste de <strong>{jobTitle}</strong>.
          </Text>
          <Text>
            <strong>Email du candidat :</strong> {candidateEmail}
          </Text>
          <Hr />
          <Section>
            <Heading as="h3">Lettre de motivation</Heading>
            <Text style={{ whiteSpace: "pre-wrap" }}>
              {coverLetter || "Non fournie"}
            </Text>
          </Section>
          <Hr />
          <Section>
            <Heading as="h3">CV</Heading>
            {cvUrl ? (
              <Link href={cvUrl} target="_blank">
                Télécharger le CV
              </Link>
            ) : (
              <Text>Non fourni</Text>
            )}
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
