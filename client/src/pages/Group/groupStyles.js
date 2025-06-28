export const styles = {
    container: {
      maxWidth: '800px',
      margin: '0 auto',
      padding: '20px'
    },
    header: {
      backgroundColor: 'white',
      borderRadius: '8px',
      padding: '20px',
      marginBottom: '20px',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
    },
    appHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '20px',
      paddingBottom: '20px',
      borderBottom: '1px solid #dddfe2'
    },
    appName: {
      fontSize: '24px',
      fontWeight: '600',
      color: '#1877f2',
      margin: 0
    },
    backButton: {
      backgroundColor: 'transparent',
      border: 'none',
      fontSize: '20px',
      cursor: 'pointer',
      color: '#65676b',
      display: 'flex',
      alignItems: 'center',
      gap: '5px',
      padding: '8px 12px',
      borderRadius: '6px',
      transition: 'background-color 0.2s ease'
    },
    backButtonHover: {
      backgroundColor: '#f0f2f5'
    },
    groupName: {
      fontSize: '24px',
      fontWeight: '600',
      marginBottom: '10px',
      color: '#1c1e21'
    },
    description: {
      fontSize: '16px',
      color: '#65676b',
      marginBottom: '20px'
    },
    membersSection: {
      backgroundColor: 'white',
      borderRadius: '8px',
      padding: '20px',
      marginBottom: '20px',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
    },
    membersTitle: {
      fontSize: '18px',
      fontWeight: '600',
      marginBottom: '15px',
      color: '#1c1e21'
    },
    membersList: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
      gap: '15px'
    },
    memberCard: {
      backgroundColor: '#f0f2f5',
      borderRadius: '8px',
      padding: '15px',
      display: 'flex',
      alignItems: 'center',
      gap: '10px'
    },
    memberAvatar: {
      width: '40px',
      height: '40px',
      borderRadius: '50%',
      backgroundColor: '#e4e6eb',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '18px',
      fontWeight: '600',
      color: '#1c1e21'
    },
    memberName: {
      fontSize: '14px',
      fontWeight: '500',
      color: '#1c1e21'
    },
    postsSection: {
      backgroundColor: 'white',
      borderRadius: '8px',
      padding: '20px',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
    },
    postForm: {
      marginBottom: '20px'
    },
    postInput: {
      width: '100%',
      padding: '10px',
      borderRadius: '8px',
      border: '1px solid #dddfe2',
      marginBottom: '10px',
      fontSize: '14px',
      resize: 'vertical',
      minHeight: '100px'
    },
    postButton: {
      backgroundColor: '#1877f2',
      color: 'white',
      border: 'none',
      borderRadius: '6px',
      padding: '8px 16px',
      fontSize: '14px',
      fontWeight: '600',
      cursor: 'pointer'
    },
    postButtonHover: {
      backgroundColor: '#166fe5'
    },
    postsList: {
      display: 'flex',
      flexDirection: 'column',
      gap: '15px'
    },
    postItem: {
      backgroundColor: '#f0f2f5',
      borderRadius: '8px',
      padding: '15px',
      marginBottom: '15px'
    },
    postAuthor: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      marginBottom: '10px'
    },
    postAuthorAvatar: {
      width: '40px',
      height: '40px',
      borderRadius: '50%',
      backgroundColor: '#e4e6eb',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '18px',
      fontWeight: '600',
      color: '#1c1e21'
    },
    postText: {
      fontSize: '14px',
      color: '#1c1e21',
      marginBottom: '10px'
    },
    postDate: {
      fontSize: '12px',
      color: '#65676b'
    },
    postInfo: {
      display: 'flex',
      justifyContent: 'space-between',
      fontSize: '12px',
      color: '#65676b'
    },
    postActions: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      marginTop: '10px'
    },
    actionButton: {
      backgroundColor: 'transparent',
      border: 'none',
      fontSize: '14px',
      cursor: 'pointer',
      color: '#65676b',
      padding: '4px 8px',
      borderRadius: '4px',
      transition: 'all 0.2s ease'
    },
    cancelButton: {
      backgroundColor: 'transparent',
      border: 'none',
      fontSize: '14px',
      cursor: 'pointer',
      color: '#65676b',
      padding: '0'
    },
    noPosts: {
      textAlign: 'center',
      color: '#65676b',
      fontStyle: 'italic'
    },
    imageUploadContainer: {
      marginTop: '10px',
      display: 'flex',
      alignItems: 'center',
      gap: '10px'
    },
    fileInput: {
      display: 'none'
    },
    uploadButton: {
      display: 'flex',
      alignItems: 'center',
      gap: '5px',
      padding: '8px 12px',
      backgroundColor: '#f0f2f5',
      borderRadius: '20px',
      cursor: 'pointer',
      fontSize: '14px',
      color: '#65676b',
      transition: 'background-color 0.2s',
      '&:hover': {
        backgroundColor: '#e4e6eb'
      }
    },
    uploadIcon: {
      fontSize: '16px'
    },
    imagePreviewContainer: {
      position: 'relative',
      marginTop: '10px'
    },
    imagePreview: {
      maxWidth: '200px',
      maxHeight: '200px',
      borderRadius: '8px',
      objectFit: 'cover'
    },
    removeImageButton: {
      position: 'absolute',
      top: '-8px',
      right: '-8px',
      backgroundColor: '#ffffff',
      border: 'none',
      borderRadius: '50%',
      width: '24px',
      height: '24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      '&:hover': {
        backgroundColor: '#f0f2f5'
      }
    }
  };