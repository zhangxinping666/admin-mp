import { Button } from 'antd';
import styles from './all.module.less';

function Forbidden() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  /** 跳转首页 */
  const goIndex = () => {
    navigate('/dashboard');
  };

  return (
    <div className="text-center">
      <h1 className={`${styles.animation} w-full text-6rem font-bold`}>403</h1>
      <p className="w-full text-20px font-bold mt-15px">{t('public.notPermissionMessage')}</p>
      <Button className="mt-25px margin-auto" onClick={goIndex}>
        {t('public.returnHome')}
      </Button>
    </div>
  );
}

export default Forbidden;
