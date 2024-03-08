import React, { useState, useEffect } from 'react';
import './App.css';

const MemberForm = ({ familyData, setFamilyData }) => {
  const [personName, setPersonName] = useState('');
  const [parent1Id, setParent1Id] = useState(0);
  const [parent2Id, setParent2Id] = useState(0);
  const [mode, setMode] = useState('add');
  const [selectedRecordId, setSelectedRecordId] = useState(null);

  const parseParent1Id = (id) => {
    const val = parseInt(id);
    setParent1Id(val);
  };

  const parseParent2Id = (id) => {
    const val = parseInt(id);
    setParent2Id(val);
  };

  const resolveName = (id) => {
    const person = familyData.find((member) => member.id === id);
    return person ? person.name : 'Unknown';
  };

  const handleEdit = (id) => {
    const selectedRecord = familyData.find(member => member.id === id);
    if (selectedRecord) {
      setPersonName(selectedRecord.name);
      setParent1Id(selectedRecord.parents[0]);
      setParent2Id(selectedRecord.parents[1]);
      setSelectedRecordId(id);
      setMode('update');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (mode === 'add') {
      const newPerson = {
        id: familyData.length + 1,
        name: personName,
        parents: [parent1Id, parent2Id]
      };
      setFamilyData([...familyData, newPerson]);
    } else if (mode === 'update') {
      const updatedFamilyData = familyData.map(member => {
        if (member.id === selectedRecordId) {
          return {
            ...member,
            name: personName,
            parents: [parent1Id, parent2Id]
          };
        }
        return member;
      });
      setFamilyData(updatedFamilyData);
      setMode('add');
      setSelectedRecordId(null);
    }
    setPersonName(''); 
    setParent1Id(0);
    setParent2Id(0);
  };

  const handleCancel = () => {
    setPersonName(''); 
    setParent1Id(0);
    setParent2Id(0);
    setMode('add');
    setSelectedRecordId(null);
  };

  const handleExport = () => {
    const jsonDataString = JSON.stringify(familyData, null, 2);
    console.log(jsonDataString);
  };

  return (
    <>
      <h2>Member Data</h2>
      <h6>{mode === 'add' ? 'Add Member' : 'Update Member'}</h6>
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
            <select className="form-control" id="parent1" value={parent1Id} onChange={(e) => parseParent1Id(e.target.value)}>
              <option value="">Select Parent 1</option>
              {familyData.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.id}: {member.name}
                </option>
              ))}
            </select>
            <label htmlFor="parent2">Parent 2's Name:</label>
            <select className="form-control" id="parent2" value={parent2Id} onChange={(e) => parseParent2Id(e.target.value)}>
              <option value="">Select Parent 2</option>
              {familyData.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.id}: {member.name}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <button type="submit" className="btn btn-primary">{mode === 'add' ? 'Add Member' : 'Update Member'}</button>
            {mode === 'update' && (
              <button type="button" className="btn btn-secondary ml-2" onClick={handleCancel}>Cancel</button>
            )}
          </div>
        </form>
      </div>
      <h2>Family Data</h2>
      <div className="row">
        {familyData.map((member) => (
          <div key={member.id} className="col-md-4 mb-3">
            <div className="card">
              <div className="card-header">
                <h5 className="card-title">{member.name}</h5>
              </div>
              <div className="card-body">
                {member.parents.map((parent, index) => (
                  <p key={index} className="card-text">Parent {index + 1}: {resolveName(parent)}</p>
                ))}
              </div>
              <div className="card-footer">
                <button onClick={() => handleEdit(member.id)} className="btn btn-link">Edit</button>
              </div>
            </div>
          </div>
        ))}
      </div>
      <button onClick={handleExport} className="btn btn-primary">Export JSON</button>
    </>
  );
};

const MemberCard = ({ name, parents }) => (
  <div className="tree-node">
    <div className="card card-container">
      <div className="card-header">
        <h5 className="card-title">{name}</h5>
      </div>
      <div className="card-body">
        <p className="card-text">Parent 1: {parents[0]}</p>
        <p className="card-text">Parent 2: {parents[1]}</p>
      </div>
    </div>
  </div>
);

const FamilyView = ({ familyData, rootId }) => {

  const getParentNames = (parentIds) => {
    return parentIds.map(parentId => {
      if (parentId === 0) {
        return 'Unknown';
      } else {
        const parent = familyData.find(member => member.id === parentId);
        return parent ? parent.name : 'Invalid';
      }
    });
  };
  
  const getAncestors = (member, generation) => {
    if (generation <= -4 || member.parents.length === 0) return [];
      const ancestors = member.parents.flatMap(parentId => {
        if (parentId === 0) return [];

        const parent = familyData.find(m => m.id === parentId);
        if (!parent) return [];
        parent.generation = generation;
        return [parent, ...getAncestors(parent, generation - 1)];
      });
    return ancestors;
  };
  
  const getDescendants = (member, generation) => {
    if (generation >= 4 || member.parents.length === 0) return [];

    const descendants = familyData.reduce((children, person) => {
      if (person.parents.includes(member.id)) {
        person.generation = generation;
        children.push(person);
        children.push(...getDescendants(person, generation + 1));
      }
      return children;
    }, []);
    
    return descendants;
  };
    
  const getFamilyMembers = (rootId) => {
    const rootMember = familyData.find(member => member.id === rootId);
    if (!rootMember) return []; // Return empty array if rootId is not found
  
    rootMember.generation = 0;
    const ancestors = getAncestors(rootMember, -1);
    const descendants = getDescendants(rootMember, 1);
    
    return [rootMember, ...ancestors, ...descendants];
  };

  const familyMembers = getFamilyMembers(rootId);
  const jsonString = JSON.stringify(familyMembers, null, 0);
    
  return (
    <div className='mt-4'>
      {jsonString}
      <h1>Dynamic Family Tree</h1>
      <div className="tree">
        { /* Group family members by generation */ }
        {[-3, -2, -1, 0, 1, 2, 3].map(generation => (
          <div key={generation} className="row">
            {familyMembers
              .filter(member => member.generation === generation)
              .map(member => (
                <MemberCard key={member.id} name={member.name} parents={getParentNames(member.parents)} />
              ))}
          </div>
        ))}
      </div>
    </div>
  )
};

const App = () => {
  const [currentPage, setCurrentPage] = useState('memberForm');
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
        <button onClick={() => handleButtonClick('memberForm')} className={`btn ${currentPage === 'memberForm' ? 'btn-primary' : 'btn-secondary'}`}>Family Management</button>
        <button onClick={() => handleButtonClick('familyView')} className={`btn ${currentPage === 'familyView' ? 'btn-primary' : 'btn-secondary'}`}>Family Tree View</button>
      </div>
      <div>
        {currentPage === 'memberForm' && <MemberForm familyData={familyData} setFamilyData={setFamilyData} />}
        {currentPage === 'familyView' && <FamilyView familyData={familyData} rootId={1} />}
      </div>
    </div>
  )
};

export default App;
