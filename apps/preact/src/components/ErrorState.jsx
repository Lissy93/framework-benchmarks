const ErrorState = ({ isVisible = false, message = '' }) => {
  return (
    <div 
      class="error" 
      data-testid="error" 
      hidden={!isVisible}
    >
      <p class="error__message">{message}</p>
    </div>
  );
};

export default ErrorState;