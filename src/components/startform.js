import React from 'react';

export default class StartForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            table: 'table1', username: 'player1', color: 'White', url: window.location.href+ "game?user=tolup&color=black&channel=table1"
        };

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleChange(event) {
        const value =  event.target.value;
        const name = event.target.name;
       
        if (name === "table") {
            const color = this.state.color === "White" ? "Black" : "White"
            const url = window.location.href + "/game?user=tolup&color=" + color + "&channel=" + value
            this.setState({
                [name]: value,
                url: url
            })
        }
        else {
            const color = value === "White" ? "Black" : "White"
            const url = window.location.href + "/game?user=tolup&color=" + color + "&channel=" + this.state.table
            this.setState({
                [name]: value,
                url: url
            })
        }
 
    }

    handleSubmit(event) {
        //alert('A name was submitted: ' + this.state.table+' '+this.state.username+' '+this.state.color);
        event.preventDefault();
        localStorage.setItem(
            'userinfo', JSON.stringify({
            channel: this.state.table,
            username: this.state.username,
            color: this.state.color,
        }));
        this.props.history.push("/game");
    }

    render() {
        return (
            <form onSubmit={this.handleSubmit}>
                <label>
                    Table:
                    <input type="text" name="table" value={this.state.table} onChange={this.handleChange} />
                </label>
                <label>
                    UserName:
                    <input type="text" name="username" value={this.state.username} onChange={this.handleChange} />
                </label>
                <label>
                    Color:
                    <select  name="color" value={this.state.color} onChange={this.handleChange}>
                        <option value="White">White</option>
                        <option value="Black">Black</option>
                    </select>
                </label>
                <label>
                    Invitation link:
                    <input type="text" name="link" value={this.state.url} />
                </label>
                <input type="submit" value="Submit" />
            </form>
        );
    }
}
