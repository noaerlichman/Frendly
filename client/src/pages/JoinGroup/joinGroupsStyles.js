export const styles = {
    container: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '2rem'
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '2rem'
    },
    backButton: {
      padding: '0.5rem 1rem',
      backgroundColor: '#f0f2f5',
      border: 'none',
      borderRadius: '6px',
      cursor: 'pointer',
      fontSize: '1rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem'
    },
    searchBox: {
      marginBottom: '2rem'
    },
    searchInput: {
      width: '100%',
      padding: '0.75rem 1rem',
      borderRadius: '6px',
      border: '1px solid #dddfe2',
      fontSize: '1rem',
      outline: 'none'
    },
    groupsList: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
      gap: '1.5rem'
    },
    groupCard: {
      backgroundColor: 'white',
      borderRadius: '8px',
      padding: '1.5rem',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
      transition: 'transform 0.2s ease'
    },
    groupName: {
      fontSize: '1.25rem',
      fontWeight: '600',
      marginBottom: '0.5rem',
      color: '#1c1e21'
    },
    groupDescription: {
      fontSize: '0.9rem',
      color: '#65676b',
      marginBottom: '1rem'
    },
    groupTags: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '0.5rem',
      marginBottom: '1rem'
    },
    groupTag: {
      backgroundColor: '#f0f2f5',
      padding: '0.25rem 0.5rem',
      borderRadius: '4px',
      fontSize: '0.8rem',
      color: '#65676b'
    },
    groupInfo: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: '1rem',
      paddingTop: '1rem',
      borderTop: '1px solid #dddfe2'
    },
    notification: {
      position: 'fixed',
      top: '20px',
      right: '20px',
      padding: '1rem 2rem',
      borderRadius: '8px',
      backgroundColor: 'white',
      boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
      zIndex: 1000,
      transition: 'all 0.3s ease',
      transform: 'translateX(120%)',
      opacity: 0
    },
    notificationShow: {
      transform: 'translateX(0)',
      opacity: 1
    },
    notificationSuccess: {
      borderLeft: '4px solid #4CAF50'
    },
    notificationInfo: {
      borderLeft: '4px solid #2196F3'
    },
    notificationError: {
      borderLeft: '4px solid #f44336'
    },
    joinButton: {
      padding: '0.5rem 1rem',
      backgroundColor: '#1877f2',
      color: 'white',
      border: 'none',
      borderRadius: '6px',
      cursor: 'pointer',
      fontSize: '0.9rem',
      transition: 'background-color 0.2s ease'
    },
    joinButtonHover: {
      backgroundColor: '#166fe5'
    },
    joinButtonDisabled: {
      backgroundColor: '#e4e6eb',
      cursor: 'not-allowed'
    },
    pendingButton: {
      padding: '0.5rem 1rem',
      backgroundColor: '#f0f2f5',
      color: '#65676b',
      border: 'none',
      borderRadius: '6px',
      cursor: 'not-allowed',
      fontSize: '0.9rem'
    }
  };