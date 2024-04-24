import * as React from "react";
import styles from "./OrderApp01.module.scss";

import type {
  IOrderApp01Props,
  IOrderAppStates,
  IOrderMasterItem,
  IOrderSitesProps,
  IProductMasterItem,
  ISitesMasterResponeItem,
  Option,
  IOrderMasterItemPost,
} from "./IOrderApp01Props";
import Select, { GroupBase } from "react-select";

import { SPFI, spfi } from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";
import { getSP } from "../pnpjsConfig";

import { PiBuildingsLight, PiCalendarBlankLight } from "react-icons/pi";
import { isNil } from "lodash";

const optionDefault = {
  options: undefined,
};

const orderTypeOptions: readonly GroupBase<Option>[] = [
  {
    label: "Online",
    options: [
      {
        value: "Online",
        label: "Online",
      },
    ],
  },
  {
    label: "Offline",
    options: [
      {
        value: "Offline",
        label: "Offline",
      },
    ],
  },
];

export default class OrderApp01 extends React.Component<
  IOrderApp01Props,
  IOrderAppStates
> {
  private _sp: SPFI;
  private _currentDate: string = new Date().toLocaleDateString("ja");
  // private alert = useAlert();

  constructor(props: IOrderApp01Props) {
    super(props);
    console.log("init");
    this.state = {
      siteMasterData: undefined,
      productMasterData: undefined,
      orderMasterData: undefined,
      isExitProductList: true,
      productOptionList: optionDefault,
      siteName: "",
      productValue: undefined,
      quantity: 0,
      orderType: {
        value: "Online",
        label: "Online",
      },
      unit: "",
      siteValue: undefined,
    };

    this._sp = getSP();
    // this._currentDate = getCurrentDate();
  }

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  componentDidMount() {
    console.log("🚀 ~ componentDidMount ~:");
    // set site master data
    if (this.state.siteMasterData === undefined) {
      this._getSiteMasterDataAPI()
        .then((response) => {
          this.setState({
            siteMasterData: response,
          });

          // SET DEFAULT VALUE OF SITE
          if (response && response.options) {
            this.setState({
              siteValue: response.options[0],
            });
          }
        })
        .catch((e) => {
          console.log("🚀 ~ componentDidMount ~ e:", e);
        });
    }

    // set product master data
    if (this.state.productMasterData === undefined) {
      this._getProductMasterDataAPI()
        .then((response) => {
          if (response) {
            console.log("🚀 ~ .then ~ response:", response);
            // convert opption product
            const productOptions = response.map((item) => {
              const { ProductName, ID } = item;

              return {
                value: ID,
                label: ProductName,
              };
            });

            this.setState({
              productMasterData: response,
              productOptionList: { options: productOptions },
              productValue: productOptions[0],
              orderType: {
                value: response[0].OrderFormat,
                label: response[0].OrderFormat,
              },
              unit: response[0].Unit,
            });
          }
        })
        .catch((e) => {
          console.log("🚀 ~ componentDidMount ~ e:", e);
        });
    }

    //set order master data
    if (this.state.orderMasterData === undefined) {
      this._getOrderMasterDataAPI()
        .then((response) =>
          this.setState({
            orderMasterData: response,
          })
        )
        .catch((e) => {
          console.log("🚀 ~ componentDidMount ~ e:", e);
        });
    }
  }

  private _getSiteMasterDataAPI = async (): Promise<
    IOrderSitesProps | undefined
  > => {
    try {
      console.log("🚀 ~ _getSiteMasterDataAPI");
      const spCache = spfi(this._sp);

      const responseData = await spCache.web.lists
        .getByTitle("SiteMaster")
        .items<ISitesMasterResponeItem[]>();

      const siteMasterDataAPI = responseData.map((item) => {
        const { SiteName } = item;

        return {
          value: SiteName,
          label: SiteName,
        };
      });
      const siteMasterDataTemp: IOrderSitesProps = {
        options: siteMasterDataAPI,
        name: "SiteMaster",
      };

      console.log(
        "🚀 ~ _getSiteMasterDataAPI ~ siteMasterDataTemp:",
        siteMasterDataTemp
      );

      return siteMasterDataTemp;
    } catch (error) {
      console.log("🚀 ~ _getSiteMasterDataAPI ~ error:", error);
    }

    // return this.props.context.spHttpClient
    //   .get(
    //     `${this.props.context.pageContext.web.absoluteUrl}/_api/web/lists/getbytitle('SiteMaster')/items`,
    //     SPHttpClient.configurations.v1
    //   )
    //   .then((response: SPHttpClientResponse) => {
    //     return response.json();
    //   })
    //   .catch((e: any) => {
    //     console.log({ e });
    //   });
  };

  private _getProductMasterDataAPI = async (): Promise<
    IProductMasterItem[] | undefined
  > => {
    try {
      console.log("🚀 ~ _getProductMasterDataAPI");
      const spCache = spfi(this._sp);

      const responseData = await spCache.web.lists
        .getByTitle("ProductMaster")
        .items<IProductMasterItem[]>();

      const productMasterDataAPI = responseData.map((item) => {
        const { ID, ProductName, Detail, OrderFormat, Remark, Unit } = item;

        return {
          ID: ID,
          ProductName: ProductName,
          Detail: Detail,
          OrderFormat: OrderFormat,
          Remark: Remark,
          Unit: Unit,
        };
      });

      console.log(
        "🚀 ~ _getProductMasterDataAPI ~ productMasterDataAPI:",
        productMasterDataAPI
      );

      return productMasterDataAPI;
    } catch (error) {
      console.log("🚀 ~ _getProductMasterDataAPI ~ error:", error);
    }
  };

  private _getOrderMasterDataAPI = async (): Promise<
    IOrderMasterItem[] | undefined
  > => {
    try {
      console.log("🚀 ~ _getOrderMasterDataAPI");
      const spCache = spfi(this._sp);

      const responseData = await spCache.web.lists
        .getByTitle("OrderMaster")
        .items.filter(`Email eq '${this.props.userEmail}'`)<
        IOrderMasterItem[]
      >();
      console.log("🚀 ~ responseData:", responseData);

      const oderMasterDataAPI = responseData.map((item) => {
        const {
          ID,
          ProductName,
          Detail,
          OrderFormat,
          Remark,
          Unit,
          Email,
          ProductID,
          Quantity,
          SiteName,
        } = item;

        return {
          ID: ID,
          ProductName: ProductName,
          Detail: Detail,
          OrderFormat: OrderFormat,
          Remark: Remark,
          Unit: Unit,
          Email: Email,
          ProductID: ProductID,
          Quantity: Quantity,
          SiteName: SiteName,
        };
      });

      return oderMasterDataAPI;
    } catch (error) {
      console.log("🚀 ~ _getOrderMasterDataAPI ~ error:", error);
    }
  };

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  private handleResetStateOrderDataToDefault = () => {
    const productData = this.state.productMasterData;
    if (productData) {
      this.setState({
        isExitProductList: true,
        productValue: {
          value: productData[0].ID,
          label: productData[0].ProductName,
        },
        quantity: 0,
        orderType: {
          value: productData[0].OrderFormat,
          label: productData[0].OrderFormat,
        },
        unit: productData[0].Unit,
      });
    }

    return;
  };

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  private handleResetStateOrderData = () => {
    this.setState({
      isExitProductList: false,
      productValue: undefined,
      quantity: 0,
      unit: "",
      orderType: {
        value: "Online",
        label: "Online",
      },
    });
  };

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  private handleOnChangeProductType = (event: {
    target: { value: string };
  }) => {
    if (event.target.value === "exit") {
      this.handleResetStateOrderDataToDefault();
    } else {
      this.handleResetStateOrderData();
    }
  };

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  private handleOnChangeProductValueInput = (event: {
    target: { value: string };
  }) => {
    this.setState({
      productValue: {
        value: event.target.value,
        label: event.target.value,
      },
    });
    return;
  };

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  private handleOnChangeUnitValue = (event: { target: { value: string } }) => {
    this.setState({
      unit: event.target.value,
    });
    return;
  };

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  private handleOnChangeQuantityNumber = (event: {
    target: { value: string };
  }) => {
    this.setState({ quantity: Number(event.target.value) });
    return;
  };

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  private handleOnChangeSite = (selections: Option) => {
    this.setState({ siteValue: selections });
    return;
  };

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  private handleOnChangeOrderType = (selections: Option) => {
    this.setState({ orderType: selections });
    return;
  };

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  private handleOnChangeProductName = (selections: Option) => {
    const productdata = this.state.productMasterData;
    if (productdata) {
      const productItems = productdata.filter((item) => {
        return item.ID === selections.value;
      });
      const productItem = productItems[0];
      this.setState({
        productValue: {
          value: productItem.ID,
          label: productItem.ProductName,
        },
        orderType: {
          value: productItem.OrderFormat,
          label: productItem.OrderFormat,
        },
        unit: productItem.Unit,
      });
      return;
    }
  };

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type, @typescript-eslint/no-explicit-any
  private handleSubmitBtn = async (event: React.FormEvent<HTMLFormElement>) => {
    console.log("🚀 ~ _addOrderMasterDataToList");
    event.preventDefault();
    // get data từ form
    const {
      siteValue,
      productValue,
      orderType,
      unit,
      quantity,
      productMasterData,
    } = this.state;

    // validate input
    if (
      isNil(productValue?.value) ||
      isNil(siteValue?.value) ||
      isNil(orderType.value) ||
      quantity < 1
    ) {
      // thông báo lỗi
      alert("Hãy điền đầy đủ thông tin cần thiết!");
      return;
    }

    let productRemark = "";

    // map data từ product list
    productMasterData?.map((item) => {
      if (item.ID === productValue?.value && item.Remark) {
        productRemark = item.Remark;
      }
    });

    const dataSubmit: Omit<IOrderMasterItemPost, "ID"> = {
      ProductName: productValue?.label as string,
      OrderFormat: orderType.value,
      Remark: productRemark,
      Unit: unit,
      Email: this.props.userEmail,
      ProductID: productValue?.value?.toString() || "",
      Quantity: quantity,
      SiteName: siteValue?.label as string,
      OrderDate: new Date(),
    };

    // insert data vào list
    const spCache = spfi(this._sp);
    await spCache.web.lists
      .getByTitle("OrderMaster")
      .items.add(dataSubmit)
      .then((result) => {
        console.log("New item added successfully:", result.data);
      })
      .catch((error) => {
        console.log("Error adding new item:", error);
      });

    // re get data from list
    this._getOrderMasterDataAPI()
      .then((response) => {
        return this.setState({
          orderMasterData: response,
        });
      })
      .catch((e) => {
        console.log("🚀 ~ componentDidMount ~ e:", e);
      });

    // reset data default for input tag
    this.handleResetStateOrderDataToDefault();
    return;
  };

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  private handleDeleteOrder = async (orderID: string) => {
    console.log("🚀 ~ privatehandleDeleteOrder");

    // delete data at lists
    const spCache = spfi(this._sp);
    await spCache.web.lists
      .getByTitle("OrderMaster")
      .items.getById(Number(orderID))
      .delete()
      .then((result) => {
        console.log("delete item successfully:");
      })
      .catch((error) => {
        console.log("Error delete item:", error);
      });

    // re get data from list
    this._getOrderMasterDataAPI()
      .then((response) => {
        return this.setState({
          orderMasterData: response,
        });
      })
      .catch((e) => {
        console.log("🚀 ~ componentDidMount ~ e:", e);
      });

    // send message delete successfully
    alert("Đã thực hiện xoá thành công!");
    return;
  };

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  render() {
    const optionsMaster = this.state.siteMasterData?.options;
    const optionsProduct = this.state.productOptionList.options;
    const {
      isExitProductList,
      orderType,
      quantity,
      unit,
      orderMasterData,
      productValue,
    } = this.state;
    console.log("🚀 ~ render ~ this.state:", this.state);
    return (
      <section className={styles.container}>
        <h3>Màn hình yêu cầu đặt hàng</h3>
        <form onSubmit={this.handleSubmitBtn}>
          <div className={styles.row_center}>
            <div className={styles["current-date"]}>
              <div className={styles.icon}>
                <PiCalendarBlankLight className={styles.item} />
              </div>
              <div>
                <p className={styles["date-data"]}>{this._currentDate}</p>
              </div>
            </div>
            {optionsMaster && (
              <div className={styles["site-master"]}>
                <div className={styles.icon}>
                  <PiBuildingsLight className={styles.item} />
                </div>
                <Select
                  id="siteMaster"
                  options={optionsMaster}
                  value={this.state.siteValue}
                  className={styles.select}
                  onChange={this.handleOnChangeSite}
                />
              </div>
            )}
          </div>
          <div className={styles.product}>
            <div className="radio-btn">
              <input
                id="exit"
                name="productType"
                type="radio"
                value="exit"
                style={{ minWidth: "unset" }}
                checked={this.state.isExitProductList}
                onChange={this.handleOnChangeProductType}
              />
              <label>Mẫu tiêu chuẩn</label>
              <input
                id="not-exit"
                name="productType"
                type="radio"
                value="not-exit"
                style={{ minWidth: "unset" }}
                checked={!this.state.isExitProductList}
                onChange={this.handleOnChangeProductType}
              />
              <label>Mẫu khác</label>
            </div>
            <div className="product-info">
              {/* form theo list product co san  */}
              {isExitProductList && (
                <>
                  {optionsProduct && (
                    <div className={styles.row}>
                      <label>Tên sản phẩm</label>
                      <Select
                        id="productName"
                        className={styles.select}
                        options={optionsProduct}
                        onChange={this.handleOnChangeProductName}
                        value={productValue}
                      />
                    </div>
                  )}
                  <div className={styles.row}>
                    <label>Số lượng</label>
                    <input
                      id="quantity"
                      name="quantity"
                      value={quantity}
                      type="number"
                      onChange={this.handleOnChangeQuantityNumber}
                    />
                    <label style={{ paddingLeft: "15px" }}>X {unit}</label>
                  </div>
                  <div className={styles.row}>
                    <label>Kiểu đặt hàng</label>
                    <label>{orderType.label}</label>
                  </div>
                </>
              )}

              {/* form theo list product khong co san  */}
              {!isExitProductList && (
                <>
                  {optionsProduct && (
                    <div className={styles.row}>
                      <label>Tên sản phẩm</label>
                      <input
                        id="productName"
                        // className={styles.select}
                        type="text"
                        value={productValue?.label}
                        onChange={this.handleOnChangeProductValueInput}
                      />
                    </div>
                  )}
                  <div className={styles.row}>
                    <label>Số lượng</label>
                    <input
                      id="quantity"
                      name="quantity"
                      type="number"
                      value={quantity}
                      onChange={this.handleOnChangeQuantityNumber}
                    />
                  </div>
                  <div className={styles.row}>
                    <label>Đơn vị</label>
                    <input
                      id="unit"
                      name="unit"
                      type="text"
                      value={unit}
                      onChange={this.handleOnChangeUnitValue}
                    />
                  </div>
                  <div className={styles.row}>
                    <label>Kiểu đặt hàng</label>
                    <Select
                      id="productOrderType"
                      name="productOrderType"
                      className={styles.select}
                      options={orderTypeOptions}
                      value={this.state.orderType}
                      onChange={this.handleOnChangeOrderType}
                    />
                  </div>
                </>
              )}
            </div>
          </div>
          <div style={{ textAlign: "center" }}>
            <button className={styles["submit-btn"]} type="submit">
              ĐĂNG KÝ ĐẶT
            </button>
          </div>
        </form>
        <div>
          <h4>Danh sách yêu cầu</h4>
          <table>
            <thead>
              <td>ID</td>
              <td>Tên Sản phẩm</td>
              <td>Số lượng</td>

              <td>Đơn vị</td>
              <td>Kiểu đặt hàng</td>
              <td>Site</td>

              <td>Remark</td>
              <td>Delete</td>
            </thead>
            <tbody>
              {orderMasterData?.map((order) => {
                const {
                  ID,
                  ProductName,
                  Quantity,
                  Unit,
                  OrderFormat,
                  SiteName,
                  Remark,
                } = order;

                return (
                  <tr key={ID}>
                    <td>{ID}</td>
                    <td>{ProductName}</td>
                    <td>{Quantity}</td>

                    <td>{Unit}</td>
                    <td>{OrderFormat}</td>
                    <td>{SiteName}</td>

                    <td>{Remark}</td>
                    <td>
                      <button
                        type="button"
                        onClick={() => this.handleDeleteOrder(ID)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div style={{ paddingTop: "30px", textAlign: "center" }}>
          <button
            className={styles["submit-btn"]}
            type="submit"
            onClick={this.handleResetStateOrderDataToDefault}
          >
            RESET
          </button>
        </div>
      </section>
    );
  }
}
