function ChildSwitcher({ babies, activeId, onSwitch, onAddChild }) {
  if (babies.length < 2) {
    return (
      <div className="child-switcher">
        <button type="button" className="child-pill add" onClick={onAddChild}>
          + Add another child
        </button>
      </div>
    )
  }

  return (
    <div className="child-switcher">
      {babies.map((baby) => (
        <button
          key={baby.id}
          type="button"
          className={`child-pill${baby.id === activeId ? ' selected' : ''}`}
          onClick={() => onSwitch(baby.id)}
        >
          {baby.name}
        </button>
      ))}
      <button type="button" className="child-pill add" onClick={onAddChild}>
        + Add
      </button>
    </div>
  )
}

export default ChildSwitcher
