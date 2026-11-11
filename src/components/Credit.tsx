export const CREDIT_EMAIL = 'anas2baba1994@gmail.com';

/** "Created by Anas Baba": the name is a mailto link */
export function Credit() {
  return (
    <p className="credit" dir="ltr">
      Created by <a href={`mailto:${CREDIT_EMAIL}`}>Anas Baba</a>
    </p>
  );
}
