import { ProductButton } from "@/components/ProductButton";

export default function Home() {
  return (
    <div className="flex flex-col items-center p-8 pt-0 pb-20 gap-20 sm:p-20 sm:pt-0 lg:pt-12">
      {/* Header */}
      <div className="flex flex-col items-center gap-4 text-center">
        <h1 className="text-6xl mb-4 leading-tight font-gt-super">
          Choose Wallet Type
        </h1>
        <p className="text-muted-foreground text-xl max-w-2xl text-center">
          Over 7 years of proven reliability and performance. Spin up wallets,
          trigger onchain actions, and stay compliant—all with one powerful,
          production-ready API or White-label Embedded Wallets.
        </p>
      </div>

      {/* Wallet Selection Buttons */}
      <div className="flex flex-col md:flex-row gap-6 w-full justify-center items-center">
        <ProductButton variant="express" />
        <ProductButton variant="embedded" />
      </div>
    </div>
  );
}
