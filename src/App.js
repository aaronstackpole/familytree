import React, { useState, useEffect } from 'react';
import './App.css';

const AddMemberForm = ({ familyData, setFamilyData }) => {
  const [personName, setPersonName] = useState('');
  const [parent1Id, setParent1Id] = useState(0);
  const [parent2Id, setParent2Id] = useState(0);

  const resolveName = (id) => {
    const person = familyData.find((member) => member.id === id);
    return person ? person.name : 'Unknown';
  };

  const handleExport = () => {
    const jsonDataString = JSON.stringify(familyData, null, 2);
    console.log(jsonDataString);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newPerson = {
      id: familyData.length + 1,
      name: personName,
      parent1: parent1Id,
      parent2: parent2Id
    };
    setFamilyData([...familyData, newPerson]);
    setPersonName('');
    setParent1Id(0);
    setParent2Id(0);
  };

  return (
    <div>
      <h2>Member Data</h2>
      <div className="form-container">
        <form onSubmit={handleSubmit} className="mt-4">
          <div className="form-group">
            <label htmlFor="name">Person's Name:</label>
            <input type="text" className="form-control" id="name"
              value={personName} onChange={(e) => setPersonName(e.target.value)} />
            <label htmlFor="id">Record ID:</label>
            <input type="text" className="form-control" id="id"
              value={familyData.length + 1} disabled />
          </div>
          <div className="form-group">
            <label htmlFor="parent1">Parent 1's Name:</label>
            <select className="form-control" id="parent1" value={parent1Id} onChange={(e) => setParent1Id(parseInt(e.target.value))}>
              <option value="">Select Parent 1</option>
              {familyData.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.id}: {member.name}
                </option>
              ))}
            </select>
            <label htmlFor="parent2">Parent 2's Name:</label>
            <select className="form-control" id="parent2" value={parent2Id} onChange={(e) => setParent2Id(parseInt(e.target.value))}>
              <option value="">Select Parent 2</option>
              {familyData.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.id}: {member.name}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <button type="submit" className="btn btn-primary">Add Person</button>
          </div>
        </form>
      </div>
      <h2>Family Data</h2>
      <div className="row">
        {familyData.map((member) => (
          <div key={member.id} className="col-md-4 mb-3">
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">{member.name}</h5>
                <p className="card-text">Parent 1: {resolveName(member.parent1)}</p>
                <p className="card-text">Parent 2: {resolveName(member.parent2)}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      <button onClick={handleExport} className="btn btn-primary">Export JSON</button>
    </div>
  );
};

const FamilyMember = ({ node: member }) => (
  <div className="tree-node">
    <div className="card node-content">
      <div className="card-body">
        <h5 className="card-title">Name: {member.name}</h5>
        <p className="card-text">Mother: {member.parent1}</p>
        <p className="card-text">Father: {member.parent2}</p>
      </div>
    </div>
    {member.children && (
      <div className="children">
        {member.children.map(child => (
          <FamilyMember key={child.id} node={child} />
        ))}
      </div>
    )}
  </div>
);

const FamilyTree = ({ data }) => {
  return (
    <div className='mt-4'>
      <h1>Dynamic Family Tree</h1>
      <div className="tree">
        {data.map(member => (
          <FamilyMember key={member.id} node={member} />
        ))}
      </div>
    </div>
)};

const App = () => {
  const [currentPage, setCurrentPage] = useState('addMemberForm');
  const [familyData, setFamilyData] = useState([]);

  // Load testing JSON from public/family.json
  useEffect(() => {
    fetch('./family.json')
      .then((response) => response.json())
      .then((data) => setFamilyData(data))
      .catch((error) => console.error('Error loading JSON:', error));
  }, []);

  const handleButtonClick = (page) => {
    setCurrentPage(page);
  };

  return (
    <div className="container">
      <div className="mt-4 mb-4">
        <button onClick={() => handleButtonClick('addMemberForm')} className={`btn ${currentPage === 'addMemberForm' ? 'btn-primary' : 'btn-secondary'}`}>Add Member</button>
        <button onClick={() => handleButtonClick('treeView')} className={`btn ${currentPage === 'treeView' ? 'btn-primary' : 'btn-secondary'}`}>View Tree</button>
      </div>
      <div>
        {currentPage === 'addMemberForm' && <AddMemberForm familyData={familyData} setFamilyData={setFamilyData} />}
        {currentPage === 'treeView' && <FamilyTree data={familyData} />}
      </div>
    </div>
  )
};

export default App;
