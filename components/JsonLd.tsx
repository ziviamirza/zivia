type Props = {
  data: Record<string, unknown>;
  id?: string;
};

/** Schema.org JSON-LD (Google Rich Results üçün). */
export default function JsonLd({ data, id }: Props) {
  return (
    <script
      id={id}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
