export const styles = {
    groupsSection: {
      padding: '1rem',
      backgroundColor: 'white',
      borderRadius: '8px',
      boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
      marginTop: '1rem'
    },
    groupsHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '1.5rem',
      paddingBottom: '1rem',
      borderBottom: '1px solid #dddfe2'
    },
    searchContainer: {
      display: 'flex',
      gap: '1rem',
      marginBottom: '1.5rem'
    },
    searchInput: {
      flex: 1,
      padding: '0.5rem 1rem',
      borderRadius: '6px',
      border: '1px solid #dddfe2',
      fontSize: '14px',
      outline: 'none'
    },
    searchButton: {
      backgroundColor: '#1877f2',
      color: 'white',
      border: 'none',
      borderRadius: '6px',
      padding: '0.5rem 1rem',
      fontSize: '14px',
      fontWeight: '600',
      cursor: 'pointer'
    },
    searchButtonHover: {
      backgroundColor: '#166fe5'
    },
    noGroups: {
      textAlign: 'center',
      padding: '2rem',
      backgroundColor: '#f0f2f5',
      borderRadius: '8px',
      color: '#65676b'
    },
    groupsList: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
      gap: '1rem',
      padding: '1rem'
    },
    groupCard: {
      backgroundColor: 'white',
      borderRadius: '8px',
      padding: '1rem',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
      transition: 'transform 0.2s ease',
      cursor: 'pointer'
    },
    groupCardHover: {
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)'
    },
    groupName: {
      fontSize: '1.2rem',
      fontWeight: '600',
      marginBottom: '0.5rem',
      color: '#1c1e21'
    },
    groupDescription: {
      fontSize: '0.9rem',
      color: '#65676b',
      marginBottom: '0.5rem'
    },
    groupTags: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '0.5rem',
      marginBottom: '0.5rem'
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
      fontSize: '0.8rem',
      color: '#65676b'
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
    },
    updateProfileButton: {
      backgroundColor: '#1877f2',
      color: 'white',
      border: 'none',
      borderRadius: '6px',
      padding: '8px 16px',
      fontSize: '14px',
      fontWeight: '600',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      margin: '10px auto'
    },
    profilePictureInput: {
      display: 'none'
    },
    profilePictureContainer: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '10px'
    }
  };