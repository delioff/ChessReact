import React, { useEffect, useState } from 'react';

const expanderStyle = {
    margin: '6px 0',
    padding: '2px',
    border: '1px solid #85C1E9'
};

const headerStyle = {
    display: 'flex',
    cursor: 'pointer'
};

const titleStyle = {
    padding: '3px',
    flex: 'none'
};

const spacerStyle = {
    flex: '1'
};

const iconStyle = {
    padding: '3px',
    flex: 'none'
};

const contentStyle = {
    overflow: 'hidden',
    transition: 'all 0.3s'
};

const contentExpandedStyle = {
    ...contentStyle,
    padding: '4px 0',
    border: '1px solid #85C1E9',
    height: 'auto',
    filter: 'opacity(1)'
};

const contentCollapsedStyle = {
    ...contentStyle,
    padding: '0 0',
    border: '1px solid transparent',
    height: '0',
    filter: 'opacity(0)'
};

const Expander = ({ title, children }) => {
    const [expanded, setExpanded] = React.useState(false);
    const handleHeaderClick = () => {
        setExpanded(expanded => !expanded);
    };
    return (
        <div style={expanderStyle}>
            <div style={headerStyle} onClick={handleHeaderClick}>
                <div style={titleStyle}>{title}</div>
                <div style={spacerStyle} />
                <div style={iconStyle}>{expanded ? '🔺' : '🔻'}</div>
            </div>
            <div style={expanded ? contentExpandedStyle : contentCollapsedStyle}>
                {children}
            </div>
        </div>
    );
};
export default function StartForm({ User, Color, RoomID, SetColorUser, IsDisabled }) {
    const [luser, setLuser] = useState();
    const [lcolor, setLcolor] = useState();
    const [lroomid, setLroomid] = useState();
    const [isDisabled, setisDisabled] = useState();
    const [url, seturl] = useState();
    const [qrCode, setQrCode] = useState("");
    useEffect(() => {
        setLcolor(Color);
        setLuser(User);
        setLroomid(RoomID);
        setisDisabled(IsDisabled)
        seturl(window.location.origin + window.location.pathname + "?user=" + User + "&color=" + Color + "&room=" + RoomID)
        let url1 = encodeURIComponent(window.location.origin + window.location.pathname + "?user=" + User + "&color=" + Color + "&room=" + RoomID)
        setQrCode(`http://api.qrserver.com/v1/create-qr-code/?data=${url1}&size=150x150`);
    }, [User, Color, RoomID, IsDisabled])
    const handleChange=(event)=>{
        const value =  event.target.value;
        const name = event.target.name;
       
        if (name === "username") {
            setLuser(value)
            seturl(window.location.origin + window.location.pathname + "?user=" + value + "&color=" + lcolor + "&room=" + lroomid)
            SetColorUser(value, lcolor)
            localStorage.setItem(
                'userinfo', JSON.stringify({
                    username: value,
                    color: lcolor,
                }));
        }
        else {
            setLcolor(value)
            seturl(window.location.origin + window.location.pathname + "?user=" + luser + "&color=" + value + "&room=" + lroomid)
            SetColorUser(luser, value)
            localStorage.setItem(
                'userinfo', JSON.stringify({
                    username: luser,
                    color: value,
                }));
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
        <Expander title={"Currentplayer details ===== Invitation link ===="+url}>
            <form onSubmit={handleSubmit}>
                <label>
                    Current Player:
                    <input type="text" name="username" value={luser} onChange={handleChange} />
                </label>
                <label>
                    Color:
                    <select name="color" value={lcolor} onChange={handleChange} disabled={isDisabled}>
                        <option value="White">White</option>
                        <option value="Black">Black</option>
                    </select>
                </label>
                <label>
                    Invitation link:
                    <input type="text" name="link" value={url} />
                </label>
                <img src={qrCode} alt="" />
                <input type="submit" value="Save curren user setup in LS" />
            </form>
           
        </Expander>
        );
   
}
