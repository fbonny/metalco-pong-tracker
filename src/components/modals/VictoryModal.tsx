interface VictoryModalProps {
  winners: { name: string; avatar?: string }[];
  onClose: () => void;
}

export default function VictoryModal({ winners, onClose }: VictoryModalProps) {
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(255, 0, 0, 0.95)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: 'white',
          border: '8px solid blue',
          maxWidth: '600px',
          width: '100%',
          padding: '40px',
          position: 'relative',
          textAlign: 'center'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h1 style={{ fontSize: '80px', fontWeight: 'bold', color: 'green', margin: 0 }}>
          WIN!
        </h1>
        <p style={{ fontSize: '24px', marginTop: '20px', color: 'black' }}>
          VINCITORI: {winners.map(w => w.name).join(' & ')}
        </p>
        <button
          onClick={onClose}
          style={{
            marginTop: '40px',
            padding: '20px 40px',
            fontSize: '24px',
            backgroundColor: 'orange',
            color: 'white',
            border: '4px solid black',
            cursor: 'pointer',
            fontWeight: 'bold',
            width: '100%'
          }}
        >
          CHIUDI MODALE
        </button>
      </div>
    </div>
  );
}