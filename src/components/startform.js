import React, { useEffect, useState }  from 'react';
export default function StartForm({ User, Color, RoomID, SetColorUser, IsDisabled }) {
    const [luser, setLuser] = useState();
    const [lcolor, setLcolor] = useState();
    const [lroomid, setLroomid] = useState();
    const [isDisabled, setisDisabled] = useState();
    const [url, seturl] = useState();
    useEffect(() => {
        setLcolor(Color);
        setLuser(User);
        setLroomid(RoomID);
        setisDisabled(IsDisabled)
        seturl(window.location.href + "?user=" + User + "&color=" + Color + "&room=" + RoomID)
    }, [User, Color, RoomID, IsDisabled])
    const handleChange=(event)=>{
        const value =  event.target.value;
        const name = event.target.name;
       
        if (name === "username") {
            setLuser(value)
            seturl(window.location.href + "?user=" + value + "&color=" + lcolor + "&room=" + lroomid)
            SetColorUser(value, lcolor)
        }
        else {
            setLcolor(value)
            seturl(window.location.href + "?user=" + luser + "&color=" + value + "&room=" + lroomid)
            SetColorUser(luser, value)
        }
 
    }

    const handleSubmit=(event) => {
        event.preventDefault();
        localStorage.setItem(
            'userinfo', JSON.stringify({
                username: luser,
                color: lcolor,
            }));
    }
    

    return (
        
            <div className="resp-table">
            <div className="resp-table-body">
                <div className="table-body-cell">Current Player</div>
                <div className="table-body-cell">                      
                        <input type="text" name="username" value={luser} onChange={handleChange} />
                </div>
                <div className="table-body-cell">Color</div>
                <div className="table-body-cell">

                    <select name="color" value={lcolor} onChange={handleChange} disabled={isDisabled}>
                        <option value="White">White</option>
                        <option value="Black">Black</option>
                    </select>
                   
                </div>
                <div className="table-body-cell">Invitation link</div>
                <div className="table-body-cell">
                    <input type="text" name="link" value={url} />
                </div>
                <div className="table-body-cell">  <button onClick={handleSubmit}>
                    <span>Save in local storage</span>
                </button></div>
            </div >
            </div >
        );
   
}
