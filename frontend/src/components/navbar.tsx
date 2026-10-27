import { AiFillThunderbolt } from "react-icons/ai";
const Navbar = () => {
  return (
    <div className='p-2 mb-3'>
        <div className='flex items-center gap-2'>
            <AiFillThunderbolt size={24} className='text-warning'/>
            <p className='text-text-primary font-bold tracking-widest font-jost italic'>GRIDBRICKS WIND GENERATION & DAY-AHEAD FORECAST ANALYTICS</p>
        </div>
    </div>
  )
}

export default Navbar