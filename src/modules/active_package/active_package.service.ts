import Active_Package from "./active_package.model";

const getActivePackageByCompany = async (
  userId: string,
) => {
  const data = Active_Package.findOne({ user: userId, expiredAt : {$gte : new Date()} }).populate({ path: 'last_purchase_package' })

  return data;
};

export const active_package_service = {
    getActivePackageByCompany
}