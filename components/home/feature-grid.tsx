import FeatureIllustrationOne from "./illustrations/feature-illustration-one";
import FeatureIllustrationTwo from "./illustrations/feature-illustration-two";
import FeatureIllustrationThree from "./illustrations/feature-illustration-three";
export default function FeatureGrid() {
  const features = [
    {
      asset: <FeatureIllustrationOne />,
      heading: "Start with 1 CELO",
      subtext:
        "Start earning profits with as low as 1 CELO in your wallet. The more you hold & invest, the more you earn.",
    },
    {
      asset: <FeatureIllustrationTwo />,
      heading: "Earn Automatically",
      subtext:
        "The CELOs earned in profit automatically gets added to your invested CELO for compounding.",
    },
    {
      asset: <FeatureIllustrationThree />,
      heading: "Earn without Risk",
      subtext:
        "When you invest CELO the invested CELO is never exposed to slashing, making it a risk free investment.",
    },
  ];
  return (
    <div className="grid grid-cols-3 gap-x-20 mt-16 px-56">
      {features.map((f) => (
        <FeatureItem asset={f.asset} heading={f.heading} subtext={f.subtext} />
      ))}
    </div>
  );
}

function FeatureItem({
  asset,
  heading,
  subtext,
}: {
  asset: JSX.Element;
  heading: string;
  subtext: string;
}) {
  return (
    <div className="flex flex-col items-center">
      {asset}
      <h4 className="mt-10 text-xl font-medium">{heading}</h4>
      <p className="mt-5 text-gray">{subtext}</p>
    </div>
  );
}
