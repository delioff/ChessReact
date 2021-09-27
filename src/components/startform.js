import React, { useEffect, useState }  from 'react';

export default function StartForm({User, Color,RoomID,SetColorUser}) {
    const [luser, setLuser] = useState();
    const [lcolor, setLcolor] = useState();
    const [lroomid, setLroomid] = useState();
    const [url, seturl] = useState();
    useEffect(() => {
        setLcolor(Color);
        setLuser(User);
        setLroomid(RoomID);
        seturl(window.location.href + "?user=" + User + "&color=" + Color + "&room=" + RoomID)
    }, [User, Color, RoomID])
    const handleChange=(event)=>{
        const value =  event.target.value;
        const name = event.target.name;
       
        if (name === "username") {
            setLuser(value)
            seturl(window.location.href + "?user=" + value + "&color=" + lcolor + "&room=" + lroomid)
            
        }
        else {
            setLcolor(value)
            seturl(window.location.href + "?user=" + luser + "&color=" + value + "&room=" + lroomid)
           
        }
 
    }

    const handleSubmit=(event) => {
        event.preventDefault();
        localStorage.setItem(
            'userinfo', JSON.stringify({
                username: luser,
                color: lcolor,
            }));
        SetColorUser(luser,lcolor)
    }
    

    return (
        <form onSubmit={handleSubmit}>
                
                <label>
                    Current Player
                    <input type="text" name="username" value={luser} onChange={handleChange} />
                </label>
                <label>
                    Color:
                    <select  name="color" value={lcolor} onChange={handleChange}>
                        <option value="White">White</option>
                        <option value="Black">Black</option>
                    </select>
                </label>
                <label>
                    Invitation link:
                    <input type="text" name="link" value={url} />
                </label>
                <input type="submit" value="Set" />
           </form>
        );
   
}
