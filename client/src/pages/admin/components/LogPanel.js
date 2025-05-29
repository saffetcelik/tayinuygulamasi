import React from 'react';
import { Alert, Card } from 'react-bootstrap';

const LogPanel = () => {
  return (
    <div className="container-fluid mt-4">
      <Card className="shadow-sm">
        <Card.Body className="text-center p-5">
          <h3 className="text-muted mb-3">Log Kaydı Sistemi Devre Dışı</h3>
          <p className="mb-0">Sistem yöneticisi tarafından log kaydı özelliği devre dışı bırakılmıştır.</p>
        </Card.Body>
      </Card>
    </div>
  );
};

export default LogPanel;
