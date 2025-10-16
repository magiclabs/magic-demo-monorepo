interface GetStartedHeaderProps {
  title: string;
  description: string;
}
export const GetStartedHeader = ({
  title,
  description,
}: GetStartedHeaderProps) => {
  return (
    <div className="flex flex-col items-center gap-4 text-center">
      <p className="text-[19px] font-jetbrains uppercase text-secondary">
        {title}
      </p>
      <h1 className="text-[56px] font-gt-super leading-tight">Get Started</h1>
      <p className="text-lg">{description}</p>
    </div>
  );
};
