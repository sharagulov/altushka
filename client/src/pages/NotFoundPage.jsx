import '@/styles/RPstyle.scss'
import { useNavigate } from 'react-router-dom';
import Button from '@/components/button/button'


const NotFoundPage = () => {

  const navigate = useNavigate();

  const handleGoHome = async () => {
    navigate("/");
  }

  return (
    <div className='flex-body'>
    <main>
      <h2 className='head-name'>Страница не найдена</h2>
      <div style={{display:"flex", justifyContent:"center"}}>
        <Button variant="primary" onClick={handleGoHome}>На главную</Button>
      </div>
      
    </main>
  </div>
  );
};

export default NotFoundPage;
