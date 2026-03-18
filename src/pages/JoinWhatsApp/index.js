import React, { useEffect, useState } from 'react';
import { collection, getDocs } from "firebase/firestore";
import { db } from '../../config/firebase';
import { content } from '../../content/staticContent';

const JoinWhatsAppPage = () => {
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const page = content.pages?.joinWhatsApp;

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'whatsapp'));
        const groupsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setGroups(groupsData);
      } catch (error) {
        // Fetch groups failed
      }
    };
    fetchGroups();
  }, []);

  const handleShowGroupInfo = (group) => setSelectedGroup(group);
  const handleClosePopup = () => setSelectedGroup(null);

  return (
    <div className="container py-4 py-lg-5">
      <h1 className="h2 fw-bold text-center mb-2">{page?.title}</h1>
      <p className="text-muted text-center marathi-text mb-4">{page?.subtitleMr}</p>

      {/* Desktop: table */}
      <div className="d-none d-md-block card border-0 shadow-sm overflow-hidden rounded-3">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="table-primary">
                <tr>
                  <th className="px-3 py-3">{page?.tableGroupName}</th>
                  <th className="px-3 py-3 text-center">{page?.tableAction}</th>
                </tr>
              </thead>
              <tbody>
                {groups.map((group) => (
                  <tr key={group.id}>
                    <td className="align-middle px-3">{group.name}</td>
                    <td className="align-middle text-center px-3">
                      <button type="button" className="btn btn-primary btn-sm" onClick={() => handleShowGroupInfo(group)}>{page?.viewInfo}</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Mobile: cards */}
      <div className="d-md-none d-flex flex-column gap-3">
        {groups.map((group) => (
          <div key={group.id} className="card shadow-sm rounded-3">
            <div className="card-body d-flex justify-content-between align-items-center flex-wrap gap-2">
              <h3 className="h6 fw-bold mb-0 text-primary">{group.name}</h3>
              <button type="button" className="btn btn-primary btn-sm" onClick={() => handleShowGroupInfo(group)}>{page?.viewInfo}</button>
            </div>
          </div>
        ))}
      </div>

      {selectedGroup && (
        <div className="modal d-block bg-dark bg-opacity-50" tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="whatsappModalTitle">
          <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
            <div className="modal-content shadow rounded-3">
              <div className="modal-header bg-primary text-white">
                <h5 id="whatsappModalTitle" className="modal-title fw-bold">{selectedGroup.name}</h5>
                <button type="button" className="btn-close btn-close-white" aria-label="Close" onClick={handleClosePopup} />
              </div>
              <div className="modal-body small">
                <p className="mb-3"><strong>{page?.modalDistrict}</strong> {selectedGroup.district}</p>
                <p className="mb-3"><strong>{page?.modalCast}</strong> {selectedGroup.cast}</p>
                <p className="mb-3"><strong>{page?.modalGroupAdmin}</strong> {selectedGroup.groupAdmin}</p>
                <p className="mb-3"><strong>{page?.modalAdminMobile}</strong> {selectedGroup.adminMobileNumber}</p>
                <p className="mb-4"><strong>{page?.modalInfo}</strong> {selectedGroup.info}</p>
                <a href={selectedGroup.groupLink?.startsWith('http') ? selectedGroup.groupLink : `https://${selectedGroup.groupLink || selectedGroup.link}`} target="_blank" rel="noopener noreferrer" className="btn btn-success w-100">
                  <i className="fab fa-whatsapp me-2" aria-hidden="true" /> {page?.joinGroup}
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JoinWhatsAppPage;
