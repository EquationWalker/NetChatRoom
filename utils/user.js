const users = [];
const register_info = []

function userJoin(id, name, room) {
    const user = {
        id,
        name,
        room
    };

    users.push(user);

    return user;
}

function userLeave(id) {
    const index = users.findIndex((user) => user.id === id);

    if (index !== -1) {
        return users.splice(index, 1)[0];
    }
}

function getRoomUsers(room) {
    return users.filter(user => user.room === room);
}

function checkVaild(name, room) {
    console.log('check', register_info, name, room);
    let res = register_info.findIndex(item=>{
        if (item.name == name && item.room == room){
            return true;
        }
    });

    if (res == -1){
        return false;
    }
    return true;  
}

function registerUser(name1, room1) {
    register_info.push({name:name1, room:room1});
}

module.exports = {
    userJoin,
    userLeave,
    getRoomUsers,
    checkVaild,
    registerUser
};