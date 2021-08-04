import { useRef, useState } from 'react'
import { DndProvider, useDrag, useDrop, XYCoord } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import './App.css'

type typeFakeDataChildren = {
  id: number
  name: string
  icon: string
  type: string
}

type typeFakeData = {
  id: number
  type: string
  icon: string
  folderName: string
  children: typeFakeDataChildren[]
}

const fakeData: typeFakeData[] = [
  {
    id: 1,
    folderName: 'Folder 1',
    icon: '',
    type: 'folder',
    children: [
      { id: 1, name: 'Item 1', icon: 'Icon', type: 'item' },
      { id: 4, name: 'Item 4', icon: 'Icon', type: 'item' },
    ],
  },
  {
    id: 2,
    folderName: 'Folder 2',
    icon: '',
    type: 'folder',
    children: [
      { id: 2, name: 'Item 2', icon: 'Icon', type: 'item' },
      { id: 5, name: 'Item 5', icon: 'Icon', type: 'item' },
      { id: 6, name: 'Item 6', icon: 'Icon', type: 'item' },
    ],
  },
  {
    id: 3,
    folderName: 'Folder 3',
    icon: '',
    type: 'folder',
    children: [{ id: 3, name: 'Item 3', icon: 'Icon', type: 'item' }],
  },
]

enum ItemTypes {
  BOX = 'box',
}

type typeColumn = {
  children: React.ReactNode
  className: string
  folderName: string
  folderSet: any
  onDrop: any
  onHover: any
  item?: any
  folderId?: any
  index: any
}

const DropFolder: React.FC<typeColumn> = ({
  item,
  folderId,
  children,
  className,
  folderName,
  folderSet,
  onDrop,
  onHover,
  index,
}) => {
  const ref = useRef<HTMLDivElement>(null)

  const [{ canDrop, isOver }, drop] = useDrop({
    accept: 'item',
    drop: onDrop,
    hover: (item: typeFakeData & { itemIndex?: number }, monitor) => {
      if (!ref.current) {
        return
      }

      const dragItemIndex = item.itemIndex
      const hoverFolderIndex = index

      // Don't replace items with themselves
      if (dragItemIndex === hoverFolderIndex) {
        return
      }

      const hoverBoundingRect = ref.current?.getBoundingClientRect()
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2

      // Determine mouse position
      const clientOffset = monitor.getClientOffset()

      // Get pixels to the top
      const hoverClientY = (clientOffset as XYCoord).y - hoverBoundingRect.top
      console.log('🚀 ~ file: DnD.tsx ~ line 113 ~ hoverClientY', hoverClientY)

      onHover(item)
      // // Only perform the move when the mouse has crossed half of the items height
      // // When dragging downwards, only move when the cursor is below 50%
      // // When dragging upwards, only move when the cursor is above 50%

      // // Dragging downwards
      // if (dragItemIndex < hoverFolderIndex && hoverClientY < hoverMiddleY) {
      //   return
      // }

      // // Dragging upwards
      // if (dragItemIndex > hoverFolderIndex && hoverClientY > hoverMiddleY) {
      //   return
      // }

      // console.log('🚀 ~ file: DnD.tsx ~ line 84 ~ dragItemIndex', dragItemIndex)
      // console.log('🚀 ~ file: DnD.tsx ~ line 86 ~ hoverFolderIndex', hoverFolderIndex)

      // Time to actually perform the action
      // onDrop(dragItemIndex, item, hoverFolderIndex)

      // // Note: we're mutating the monitor item here!
      // // Generally it's better to avoid mutations,
      // // but it's good here for the sake of performance
      // // to avoid expensive index searches.
      // item.id = hoverFolderIndex

      // console.log(item.id)
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  })

  drop(ref)

  return (
    <div ref={ref} className={className} style={{ backgroundColor: isOver ? 'red' : 'green' }}>
      <div className="folderName">{folderName}</div>
      <div className="container">{children}</div>
    </div>
  )
}

type typeMovableItem = {
  id: number
  children: React.ReactNode
  className: string
  compName: string
  prop: any
  type: string
  index: Number
}

const GrabItem: React.FC<typeMovableItem> = ({
  index,
  id,
  children,
  className,
  compName,
  type,
  prop,
}) => {
  const [{ isDragging }, drag] = useDrag({
    type: type,
    item: { ...prop, itemIndex: index },
    end: (item, monitor) => {
      const dropResult = monitor.getDropResult()
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  })

  return (
    <div ref={drag} className={className} style={{ opacity: isDragging ? 0.7 : 1 }}>
      {children}
    </div>
  )
}

const App = () => {
  const [folder, folderSet] = useState(fakeData)

  const handleHover = (folderId: number, item: typeFakeDataChildren, folderIndex: number) => {
    console.log('22')
  }

  const handleDrop = (folderId: number, item: typeFakeDataChildren, folderIndex: number) => {
    // console.log('🚀 ~ folderId', folderId)
    // console.log('🚀 ~ item', item)
    // console.log('🚀 ~ folderIndex', folderIndex)

    folderSet((prevState) => {
      for (const obj of prevState) {
        obj.children = obj.children.filter((el) => item.id !== el.id)
      }

      // prevState[--folderId].children.push(item)
      prevState[--folderId].children.splice(1, 0, item)

      return [...prevState]
    })
  }

  return (
    <div className="main">
      <div className="container">
        <DndProvider backend={HTML5Backend}>
          {folder.map((prop, idx) => {
            const { id, folderName, type, children } = prop
            return (
              <GrabItem
                key={id}
                id={id}
                className="folder-container"
                compName={folderName}
                prop={prop}
                type={type}
                index={idx}
              >
                <DropFolder
                  className="column"
                  folderName={folderName}
                  onDrop={(item: typeFakeDataChildren) => handleDrop(id, item, idx)}
                  onHover={(item: typeFakeDataChildren) => handleHover(id, item, idx)}
                  folderSet={folderSet}
                  index={idx}
                >
                  <>
                    {children.map((prop, idx) => {
                      return (
                        <GrabItem
                          key={prop.id}
                          id={prop.id}
                          className="movable-item"
                          compName={prop.name}
                          prop={prop}
                          type={prop.type}
                          index={idx}
                        >
                          {prop.name}
                        </GrabItem>
                      )
                    })}
                  </>
                </DropFolder>
              </GrabItem>
            )
          })}
        </DndProvider>
      </div>
    </div>
  )
}

export default App
