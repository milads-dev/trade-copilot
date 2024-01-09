export default function CaretLeft(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      className="h-4 w-4 text-gray-800 dark:text-white"
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 10 16"
    >
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M7.293 1.707 1.707 7.293a1 1 0 0 0 0 1.414l5.586 5.586A1 1 0 0 0 9 13.586V2.414a1 1 0 0 0-1.707-.707Z"
      />
    </svg>
  );
}
