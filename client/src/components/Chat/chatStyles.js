export const chatWindowStyles = {
    container: {
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      width: '350px',
      height: '500px',
      backgroundColor: 'white',
      borderRadius: '12px',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 1000
    },
    header: {
      padding: '15px',
      borderBottom: '1px solid #dddfe2',
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      backgroundColor: '#1877f2',
      color: 'white',
      borderRadius: '12px 12px 0 0'
    },
    avatar: {
      width: '40px',
      height: '40px',
      borderRadius: '50%',
      overflow: 'hidden',
      backgroundColor: '#e4e6eb'
    },
    headerInfo: {
      flex: 1
    },
    name: {
      fontWeight: '600',
      fontSize: '16px'
    },
    closeButton: {
      background: 'none',
      border: 'none',
      color: 'white',
      cursor: 'pointer',
      fontSize: '20px',
      padding: '5px'
    },
    messagesContainer: {
      flex: 1,
      padding: '15px',
      overflowY: 'auto',
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
      backgroundColor: '#f0f2f5'
    },
    message: {
      maxWidth: '80%',
      padding: '8px 12px',
      borderRadius: '18px',
      fontSize: '14px',
      lineHeight: '1.4'
    },
    sentMessage: {
      alignSelf: 'flex-end',
      backgroundColor: '#1877f2',
      color: 'white'
    },
    receivedMessage: {
      alignSelf: 'flex-start',
      backgroundColor: 'white',
      color: '#1c1e21'
    },
    inputContainer: {
      padding: '15px',
      borderTop: '1px solid #dddfe2',
      display: 'flex',
      gap: '10px',
      backgroundColor: 'white',
      borderRadius: '0 0 12px 12px'
    },
    input: {
      flex: 1,
      padding: '8px 12px',
      borderRadius: '20px',
      border: '1px solid #dddfe2',
      fontSize: '14px',
      outline: 'none'
    },
    sendButton: {
      backgroundColor: '#1877f2',
      color: 'white',
      border: 'none',
      borderRadius: '50%',
      width: '36px',
      height: '36px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      fontSize: '16px'
    }
  };