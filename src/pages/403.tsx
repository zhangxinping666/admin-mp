import { Button } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import styles from './all.module.less';

function Forbidden() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const goIndex = () => {
    navigate('/login');
  };

  return (
    <div className="text-center">
      <h1 className={`${styles.animation} w-full text-6rem font-bold`}>403</h1>
      <p className="w-full text-20px font-bold mt-15px">{t('public.notPermissionMessage')}</p>
      <Button className="mt-25px margin-auto" onClick={goIndex}>
        {"返回登录页"}
      </Button>
    </div>
  );
}

export default Forbidden;
