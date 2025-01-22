import {UsersTable} from "@/components/users/UsersTable";
import {axiosClient} from "@/libs/axios";

export default async function UsersPage() {
    const {data} = await axiosClient.get("/admin/users");
    console.log(data);

    return <UsersTable pageData={data}/>
}