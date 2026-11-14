import { useAppLanguage } from '../../utils/appLanguage.js';
import CvOnlinePageCN from './CvOnlinePageCN.jsx';
import CvOnlinePageEN from './CvOnlinePageEN.jsx';
import CvOnlinePageVI from './CvOnlinePageVI.jsx';

export default function CvOnlineRoute() {
  const language = useAppLanguage();

  if (language === 'EN') return <CvOnlinePageEN />;
  if (language === 'CN') return <CvOnlinePageCN />;
  return <CvOnlinePageVI />;
}
