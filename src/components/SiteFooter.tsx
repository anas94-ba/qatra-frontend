import { Credit } from './Credit';

/** Public footer: mission note, copyright and the creator credit, all centered */
export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container footer-inner">
        <p className="footer-note">
          قطرة منصة تنسيقية: التوصيات تعكس البيانات المسجلة فقط، وغياب بيانات المساعدات لا يعني عدم وصول المياه.
        </p>
        <Credit />
        <p className="copyright">© {new Date().getFullYear()} قطرة. جميع الحقوق محفوظة.</p>
      </div>
    </footer>
  );
}
