import { Credit } from './Credit';
import { t } from '../i18n';

/** Public footer: mission note, copyright and the creator credit, all centered */
export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container footer-inner">
        <p className="footer-note">
          {t("قطرة منصة تنسيقية: التوصيات تعكس البيانات المسجلة فقط، وغياب بيانات المساعدات لا يعني عدم وصول المياه.")}
        </p>
        <Credit />
        <p className="copyright">{t('© {0} قطرة. جميع الحقوق محفوظة.', [new Date().getFullYear()])}</p>
      </div>
    </footer>
  );
}
