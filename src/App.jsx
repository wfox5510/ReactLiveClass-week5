import { useState, useEffect, useRef } from "react";
import "./App.css";
import axios from "axios";
import "../node_modules/bootstrap/dist/css/bootstrap.min.css";
import { useForm } from "react-hook-form";
import { ErrorMessage } from "@hookform/error-message";
import { Modal } from "bootstrap";
import ReactLoading from "react-loading";

const API_BASE = import.meta.env.VITE_BASE_URL;
const API_PATH = import.meta.env.VITE_API_PATH;

function App() {
  const [productData, setProductData] = useState(null);
  const [cartData, setCartData] = useState(null);
  const [tempProduct, setTempProduct] = useState(null);
  const [qtySelect, setQtySelect] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isComponentLoading, setIsComponentLoading] = useState(false);
  const productModalRef = useRef(null);

  useEffect(() => {
    new Modal(productModalRef.current, { backdrop: false });
    getProduct();
    getCart();
  }, []);
  useEffect(() => {
    //console.log(cartData);
  }, [cartData]);

  const getProduct = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get(`${API_BASE}/api/${API_PATH}/products/all`);
      setProductData(res.data.products);
      setIsLoading(false);
    } catch (error) {
      alert(error.response.data.message);
    } finally {
      setIsLoading(false);
    }
  };
  const getCart = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/${API_PATH}/cart`);
      setCartData(res.data.data);
    } catch (error) {
      alert(error.response.data.message);
    }
  };
  const handleProductBtn = (productItem) => {
    setTempProduct(productItem);
    openModal();
  };
  const handleModalBtn = async (id, qty) => {
    await addCart(id, qty);
    closeModal();
  };
  const openModal = () => {
    let modal = Modal.getInstance(productModalRef.current);
    modal.show();
  };
  const closeModal = () => {
    let modal = Modal.getInstance(productModalRef.current);
    modal.hide();
  };

  const addCart = async (id, qty = 1) => {
    try {
      setIsComponentLoading(true);
      await axios.post(`${API_BASE}/api/${API_PATH}/cart`, {
        data: {
          product_id: id,
          qty: Number(qty),
        },
      });
      await getCart();
      setIsComponentLoading(false);
    } catch (error) {
      alert(error.response.data.message);
    } finally {
      setIsComponentLoading(false);
    }
  };
  const delCartItem = async (id) => {
    try {
      setIsComponentLoading(true);
      axios.delete(`${API_BASE}/api/${API_PATH}/cart/${id}`);
      await getCart();
      setIsComponentLoading(false);
    } catch (error) {
      alert(error.response.data.message);
    } finally {
      setIsComponentLoading(false);
    }
  };
  const delCarts = async () => {
    try {
      setIsLoading(true);
      await axios.delete(`${API_BASE}/api/${API_PATH}/carts`);
      await getCart();
    } catch (error) {
      alert(error.response.data.message);
    } finally {
      setIsLoading(false);
    }
  };
  const putCartItem = async (id, qty) => {
    try {
      setIsLoading(true);
      await axios.put(`${API_BASE}/api/${API_PATH}/cart/${id}`, {
        data: {
          product_id: id,
          qty: Number(qty),
        },
      });
      await getCart();
      setIsLoading(false);
    } catch (error) {
      alert(error.response.data.message);
    } finally {
      setIsLoading(false);
    }
  };

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const onSubmit = async (formData) => {
    const { name, email, tel, address, message } = formData;
    try {
      setIsLoading(true);
      const res = await axios.post(`${API_BASE}/api/${API_PATH}/order`, {
        data: {
          user: {
            name: name,
            email: email,
            tel: tel,
            address: address,
          },
          message: message,
        },
      });
      console.log(res);
      reset();
      await getCart();
      setIsLoading(false);
    } catch (error) {
      alert(error);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div id="app">
      <div className="container">
        {isLoading && (
          <div
            className="d-flex justify-content-center align-items-center"
            style={{
              position: "fixed",
              inset: 0,
              backgroundColor: "rgba(255,255,255,0.3)",
              zIndex: 1000,
            }}
          >
            <ReactLoading
              type="spinningBubbles"
              color="black"
              height={"100px"}
              width={"100px"}
            />
          </div>
        )}
        <div className="mt-4">
          <div
            ref={productModalRef}
            style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
            className="modal fade"
            id="productModal"
            tabIndex="-1"
          >
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h2 className="modal-title fs-5">
                    產品名稱：{tempProduct?.title}
                  </h2>
                  <button
                    // onClick={closeModal}
                    type="button"
                    className="btn-close"
                    onClick={closeModal}
                    aria-label="Close"
                  ></button>
                </div>
                <div className="modal-body">
                  <img
                    src={tempProduct?.imageUrl}
                    alt={tempProduct?.title}
                    className="img-fluid"
                  />
                  <p>內容：{tempProduct?.content}</p>
                  <p>描述：{tempProduct?.description}</p>
                  <p>
                    價錢：{tempProduct?.price}{" "}
                    <del>{tempProduct?.origin_price}</del> 元
                  </p>
                  <div className="input-group align-items-center">
                    <label htmlFor="qtySelect">數量：</label>
                    <select
                      onChange={(e) => setQtySelect(e.target.value)}
                      id="qtySelect"
                      className="form-select"
                    >
                      {Array.from({ length: 10 }).map((_, index) => (
                        <option key={index} value={index + 1}>
                          {index + 1}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => {
                      handleModalBtn(tempProduct.id, qtySelect);
                    }}
                    disabled={isComponentLoading}
                  >
                    加入購物車
                    {isComponentLoading && (
                      <i className="fas fa-spinner fa-pulse ms-1"></i>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
          <table className="table align-middle">
            <thead>
              <tr>
                <th>圖片</th>
                <th>商品名稱</th>
                <th>價格</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {productData?.map((productItem) => {
                return (
                  <tr key={productItem.id}>
                    <td style={{ width: "200px" }}>
                      <div
                        style={{
                          height: "100px",
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                          backgroundImage: `url(${productItem.imageUrl})`,
                        }}
                      ></div>
                    </td>
                    <td>{productItem.title}</td>
                    <td>
                      <div className="h5"></div>
                      <del className="h6">原價 {productItem.origin_price}</del>
                      <div className="h5">特價 {productItem.price}</div>
                    </td>
                    <td>
                      <div className="btn-group btn-group-sm">
                        <button
                          type="button"
                          className="btn btn-outline-secondary"
                          onClick={() => handleProductBtn(productItem)}
                          disabled={isComponentLoading}
                        >
                          查看更多
                          {isComponentLoading && (
                            <i className="fas fa-spinner fa-pulse ms-1"></i>
                          )}
                        </button>
                        <button
                          type="button"
                          className="btn btn-outline-danger"
                          disabled={isComponentLoading}
                          onClick={() => {
                            addCart(productItem.id);
                          }}
                        >
                          加到購物車
                          {isComponentLoading && (
                            <i className="fas fa-spinner fa-pulse ms-1"></i>
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {/* 購物車 */}
          {cartData?.carts.length !== 0 && (
            <>
              <div className="text-end">
                <button
                  className="btn btn-outline-danger"
                  type="button"
                  onClick={delCarts}
                >
                  清空購物車
                </button>
              </div>
              <table className="table align-middle">
                <thead>
                  <tr>
                    <th></th>
                    <th>品名</th>
                    <th style={{ width: "150px" }}>數量/單位</th>
                    <th>單價</th>
                  </tr>
                </thead>
                <tbody>
                  {cartData?.carts?.map((cartItem) => {
                    return (
                      <tr key={cartItem.id}>
                        <th>
                          <button
                            type="button"
                            className="btn btn-danger"
                            onClick={() => delCartItem(cartItem.id)}
                          >
                            X
                          </button>
                        </th>
                        <th>{cartItem.product.title}</th>
                        <th style={{ width: "150px" }}>
                          <button
                            type="button"
                            className="btn btn-primary me-2 w-25"
                            onClick={() =>
                              putCartItem(cartItem.id, cartItem.qty - 1)
                            }
                          >
                            -
                          </button>
                          {cartItem.qty}
                          <button
                            type="button"
                            className="btn btn-primary ms-2 w-25"
                            onClick={() =>
                              putCartItem(cartItem.id, cartItem.qty + 1)
                            }
                          >
                            +
                          </button>
                        </th>
                        <th>{cartItem.product.origin_price}</th>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan="3" className="text-end">
                      總計
                    </td>
                    <td className="text-end">{cartData?.total}</td>
                  </tr>
                  <tr>
                    <td colSpan="3" className="text-end text-success">
                      折扣價
                    </td>
                    <td className="text-end text-success">
                      {cartData?.final_total}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </>
          )}
        </div>
        {/* 訂單表單 */}
        <div className="my-5 row justify-content-center">
          <form className="col-md-6" onSubmit={handleSubmit(onSubmit)}>
            <div className="mb-3">
              <label htmlFor="email" className="form-label">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                className="form-control"
                placeholder="請輸入 Email"
                {...register("email", {
                  required: "請輸入Email",
                  pattern: {
                    value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                    message: "Email格式錯誤",
                  },
                })}
              />
              <ErrorMessage
                errors={errors}
                name="email"
                render={({ message }) => (
                  <p className="form-error text-start">{message}</p>
                )}
              />
            </div>

            <div className="mb-3">
              <label htmlFor="name" className="form-label">
                收件人姓名
              </label>
              <input
                id="name"
                name="姓名"
                type="text"
                className="form-control"
                placeholder="請輸入姓名"
                {...register("name", { required: "請輸入姓名" })}
              />
              <ErrorMessage
                errors={errors}
                name="name"
                render={({ message }) => (
                  <p className="form-error text-start">{message}</p>
                )}
              />
            </div>

            <div className="mb-3">
              <label htmlFor="tel" className="form-label">
                收件人電話
              </label>
              <input
                id="tel"
                name="電話"
                type="text"
                className="form-control"
                placeholder="請輸入電話"
                {...register("tel", {
                  required: "請輸入電話",
                  pattern: {
                    value: /^(0[2-8]\d{7}|09\d{8})$/,
                    message: "電話格式錯誤",
                  },
                })}
              />
              <ErrorMessage
                errors={errors}
                name="tel"
                render={({ message }) => (
                  <p className="form-error text-start">{message}</p>
                )}
              />
            </div>

            <div className="mb-3">
              <label htmlFor="address" className="form-label">
                收件人地址
              </label>
              <input
                id="address"
                name="地址"
                type="text"
                className="form-control"
                placeholder="請輸入地址"
                {...register("address", {
                  required: "請輸入地址",
                })}
              />
              <ErrorMessage
                errors={errors}
                name="address"
                render={(
                  { message } //在errorMsg內傳給render一個message的props，errorMsg就可以透過提供的這段函式解構並且輸出訊息
                ) => <p className="form-error text-start">{message}</p>}
              />
            </div>

            <div className="mb-3">
              <label htmlFor="message" className="form-label">
                留言
              </label>
              <textarea
                id="message"
                className="form-control"
                cols="30"
                rows="10"
                {...register("message")}
              ></textarea>
            </div>
            <div className="text-end">
              <button type="submit" className="btn btn-danger">
                送出訂單
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
export default App;
