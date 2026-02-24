import AuthForm from '../components/auth-form';

export default function SignUpPage() {
  return <AuthForm
          title="Welcome to Growdex"
          subTitle='Plan, launch, manage and optimize ads across platforms from one place powered by AI
          that brings clarity to your growth.'
          isAuthType="register"
         />;
}
