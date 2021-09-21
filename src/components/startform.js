import React from 'react';

export default class StartForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = { table: 'table1',username:'player1',color:'white' };

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleChange(event) {
        const value =  event.target.value;
        const name = event.target.name;
        this.setState({
            [name]: value
        });
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
                <input type="submit" value="Submit" />
            </form>
        );
    }
}
